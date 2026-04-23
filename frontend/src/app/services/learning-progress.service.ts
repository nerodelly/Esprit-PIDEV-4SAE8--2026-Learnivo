import { Injectable, signal } from '@angular/core';
import { Training } from './data.service';

interface CourseProgress {
  completedChapters: number[];
  quizAttempts: number;
  quizPassed: boolean;
  revealAnswers: boolean;
  quizId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class LearningProgressService {
  private readonly storageKey = 'frontend_learning_progress';
  private progressStore = signal<Record<string, CourseProgress>>(this.readStore());

  getNextLearningRoute(training: Training, hasQuiz = false) {
    const nextChapter = this.getNextUnlockedIncompleteChapter(training);
    if (nextChapter) {
      return ['/courses', training.slug, String(nextChapter.number)];
    }

    return hasQuiz ? ['/courses', training.slug, 'quiz'] : ['/courses', training.slug];
  }

  isChapterCompleted(trainingSlug: string, chapterNumber: number) {
    return this.getCourseProgress(trainingSlug).completedChapters.includes(chapterNumber);
  }

  isChapterUnlocked(training: Training, chapterNumber: number) {
    const chapters = training.chaptersData ?? [];
    const chapterIndex = chapters.findIndex((chapter) => chapter.number === chapterNumber);
    if (chapterIndex <= 0) {
      return chapterIndex === 0;
    }

    const previousChapter = chapters[chapterIndex - 1];
    return this.isChapterCompleted(training.slug, previousChapter.number);
  }

  isQuizUnlocked(training: Training) {
    const chapters = training.chaptersData ?? [];
    return chapters.length > 0 && chapters.every((chapter) => this.isChapterCompleted(training.slug, chapter.number));
  }

  getCompletedChapters(trainingSlug: string) {
    return [...this.getCourseProgress(trainingSlug).completedChapters];
  }

  getCompletedChapterCount(training: Training) {
    return (training.chaptersData ?? []).filter((chapter) =>
      this.isChapterCompleted(training.slug, chapter.number)
    ).length;
  }

  getProgressPercent(training: Training, hasQuiz: boolean) {
    const totalChapters = training.chaptersData?.length ?? 0;
    const completedChapters = this.getCompletedChapterCount(training);
    const hasAnyQuizAttempt = this.getQuizAttempts(training.slug) > 0;

    if (totalChapters <= 0) {
      if (!hasQuiz) return 0;
      if (this.hasPassedQuiz(training.slug)) return 100;
      return hasAnyQuizAttempt ? 80 : 0;
    }

    const chapterProgress = Math.round((completedChapters / totalChapters) * 50);
    if (!hasQuiz) {
      return chapterProgress;
    }

    if (this.hasPassedQuiz(training.slug)) {
      return 100;
    }

    if (hasAnyQuizAttempt && this.areAllChaptersCompleted(training)) {
      return 80;
    }

    return chapterProgress;
  }

  getQuizAttempts(trainingSlug: string) {
    return this.getCourseProgress(trainingSlug).quizAttempts;
  }

  syncQuizState(trainingSlug: string, quizId: number | string | null) {
    const normalizedQuizId = quizId == null ? null : String(quizId);
    const progress = this.getCourseProgress(trainingSlug);

    if (progress.quizId === normalizedQuizId) {
      return progress;
    }

    const updated: CourseProgress = {
      ...progress,
      quizAttempts: 0,
      quizPassed: false,
      revealAnswers: false,
      quizId: normalizedQuizId
    };
    this.saveCourseProgress(trainingSlug, updated);
    return updated;
  }

  hasPassedQuiz(trainingSlug: string) {
    return this.getCourseProgress(trainingSlug).quizPassed;
  }

  shouldRevealQuizAnswers(trainingSlug: string) {
    return this.getCourseProgress(trainingSlug).revealAnswers;
  }

  markChapterCompleted(trainingSlug: string, chapterNumber: number) {
    const progress = this.getCourseProgress(trainingSlug);
    if (!progress.completedChapters.includes(chapterNumber)) {
      const updated: CourseProgress = {
        ...progress,
        completedChapters: [...progress.completedChapters, chapterNumber].sort((a, b) => a - b)
      };
      this.saveCourseProgress(trainingSlug, updated);
    }
  }

  areAllChaptersCompleted(training: Training) {
    return (training.chaptersData ?? []).every((chapter) =>
      this.isChapterCompleted(training.slug, chapter.number)
    );
  }

  getNextUnlockedIncompleteChapter(training: Training) {
    return (training.chaptersData ?? []).find((chapter) =>
      this.isChapterUnlocked(training, chapter.number)
      && !this.isChapterCompleted(training.slug, chapter.number)
    ) ?? null;
  }

  recordQuizAttempt(trainingSlug: string, passed: boolean) {
    const progress = this.getCourseProgress(trainingSlug);
    const attempts = Math.min(2, progress.quizAttempts + 1);
    const updated: CourseProgress = {
      ...progress,
      quizAttempts: attempts,
      quizPassed: progress.quizPassed || passed,
      revealAnswers: !passed && attempts >= 2
    };
    this.saveCourseProgress(trainingSlug, updated);
    return updated;
  }

  resetQuiz(trainingSlug: string) {
    const progress = this.getCourseProgress(trainingSlug);
    const updated: CourseProgress = {
      ...progress,
      quizAttempts: 0,
      quizPassed: false,
      revealAnswers: false
    };
    this.saveCourseProgress(trainingSlug, updated);
  }

  private getCourseProgress(trainingSlug: string): CourseProgress {
    const store = this.progressStore();
    const progress = store[trainingSlug];
    return {
      completedChapters: Array.isArray(progress?.completedChapters) ? progress.completedChapters : [],
      quizAttempts: Math.min(2, Math.max(0, Number(progress?.quizAttempts ?? 0) || 0)),
      quizPassed: Boolean(progress?.quizPassed),
      revealAnswers: Boolean(progress?.revealAnswers),
      quizId: progress?.quizId == null ? null : String(progress.quizId)
    };
  }

  private saveCourseProgress(trainingSlug: string, progress: CourseProgress) {
    const store = { ...this.progressStore(), [trainingSlug]: progress };
    this.progressStore.set(store);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, JSON.stringify(store));
    }
  }

  private readStore(): Record<string, CourseProgress> {
    if (typeof window === 'undefined') return {};

    const stored = window.localStorage.getItem(this.storageKey);
    if (!stored) return {};

    try {
      return JSON.parse(stored) as Record<string, CourseProgress>;
    } catch {
      window.localStorage.removeItem(this.storageKey);
      return {};
    }
  }
}
