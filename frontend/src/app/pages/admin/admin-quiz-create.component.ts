import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { DataService, Quiz, QuizQuestion, Training } from '../../services/data.service';

@Component({
  selector: 'app-admin-quiz-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="space-y-2">
          <a routerLink="/admin/quizzes" class="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:underline">
            <lucide-icon [name]="ArrowLeftIcon" [size]="16"></lucide-icon>
            Back to quizzes
          </a>
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight">Create Quiz</h1>
            <p class="text-muted-foreground">Add a standalone quiz and associate it with a course title.</p>
          </div>
        </div>
      </div>

      <form #quizForm="ngForm" class="space-y-8" (ngSubmit)="createQuiz(quizForm)">
        <div class="space-y-6 rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <label class="block space-y-2">
            <span class="text-sm font-semibold text-foreground">Quiz title</span>
            <input
              type="text"
              name="title"
              #titleModel="ngModel"
              [(ngModel)]="draft.title"
              required
              minlength="5"
              maxlength="120"
              class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
            @if ((titleModel.touched || quizForm.submitted) && titleModel.invalid) {
              <p class="text-sm text-rose-600">Quiz title must be between 5 and 120 characters.</p>
            }
          </label>

          <div class="grid gap-5 md:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Course</span>
              <select
                name="course"
                #courseModel="ngModel"
                [(ngModel)]="draft.course"
                required
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              >
                <option value="">Select a course</option>
                <option *ngFor="let course of courseOptions()" [value]="course">{{ course }}</option>
              </select>
              @if ((courseModel.touched || quizForm.submitted) && courseModel.invalid) {
                <p class="text-sm text-rose-600">Please select a course.</p>
              } @else if (courseOptions().length === 0) {
                <p class="text-sm text-amber-600">All courses already have a quiz assigned.</p>
              }
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Category</span>
              <select
                name="category"
                #categoryModel="ngModel"
                [(ngModel)]="draft.category"
                required
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              >
                <option value="">Select a category</option>
                <option *ngFor="let category of categoryOptions" [value]="category">{{ category }}</option>
              </select>
              @if ((categoryModel.touched || quizForm.submitted) && categoryModel.invalid) {
                <p class="text-sm text-rose-600">Please select a category.</p>
              }
            </label>
          </div>

          <div class="grid gap-5 md:grid-cols-1">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Status</span>
              <select
                name="status"
                [(ngModel)]="draft.status"
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              >
                <option *ngFor="let status of statusOptions" [value]="status">{{ status }}</option>
              </select>
            </label>

            @if (draft.status === 'Published') {
              <label class="space-y-2">
                <span class="text-sm font-semibold text-foreground">Publication date and time</span>
                <input
                  type="datetime-local"
                  name="publishAt"
                  #publishAtModel="ngModel"
                  [(ngModel)]="draft.publishAt"
                  required
                  [min]="minPublishAt"
                  class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                />
                @if ((publishAtModel.touched || quizForm.submitted) && publishAtModel.invalid) {
                  <p class="text-sm text-rose-600">Choose a publication date and time that is now or later.</p>
                } @else {
                  <p class="text-xs text-muted-foreground">Learners will only see this quiz after the chosen date and time.</p>
                }
              </label>
            }
          </div>

          <div class="grid gap-5 md:grid-cols-3">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Questions</span>
              <input
                type="number"
                name="questions"
                #questionsModel="ngModel"
                [(ngModel)]="draft.questions"
                (ngModelChange)="onQuestionCountChange($event)"
                required
                min="3"
                max="10"
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
              @if ((questionsModel.touched || quizForm.submitted) && questionsModel.invalid) {
                <p class="text-sm text-rose-600">Questions must be between 3 and 10.</p>
              }
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Duration</span>
              <input
                type="text"
                name="duration"
                #durationModel="ngModel"
                [(ngModel)]="draft.duration"
                required
                pattern="^[0-9]+\\s*(min|mins|minute|minutes)$"
                placeholder="e.g. 15 min"
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
              @if ((durationModel.touched || quizForm.submitted) && durationModel.invalid) {
                <p class="text-sm text-rose-600">Use a format like "15 min".</p>
              }
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Pass score (%)</span>
              <input
                type="number"
                name="passScore"
                #passScoreModel="ngModel"
                [(ngModel)]="draft.passScore"
                required
                min="70"
                max="100"
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
              @if ((passScoreModel.touched || quizForm.submitted) && passScoreModel.invalid) {
                <p class="text-sm text-rose-600">Pass score must be between 70 and 100.</p>
              }
            </label>
          </div>

          <div class="space-y-4 rounded-[2rem] border border-border bg-muted/20 p-5">
            <div>
              <h2 class="text-lg font-bold text-foreground">Quiz questions</h2>
              <p class="text-sm text-muted-foreground">Add between 3 and 10 questions, 4 options each, and select the correct answer.</p>
            </div>

            @for (question of questionDrafts(); track $index; let questionIndex = $index) {
              <div class="space-y-4 rounded-[1.5rem] border border-border bg-white p-5">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-bold text-foreground">Question {{ questionIndex + 1 }}</h3>
                  <span class="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    4 options required
                  </span>
                </div>

                <label class="block space-y-2">
                  <span class="text-sm font-semibold text-foreground">Question text</span>
                  <input
                    type="text"
                    [name]="'question-text-' + questionIndex"
                    [(ngModel)]="question.text"
                    required
                    maxlength="220"
                    class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                  />
                </label>

                <div class="grid gap-4 md:grid-cols-2">
                  @for (option of question.options; track $index; let optionIndex = $index) {
                    <label class="block space-y-2">
                      <span class="text-sm font-semibold text-foreground">Option {{ optionIndex + 1 }}</span>
                      <input
                        type="text"
                        [name]="'question-' + questionIndex + '-option-' + optionIndex"
                        [(ngModel)]="question.options[optionIndex]"
                        required
                        maxlength="140"
                        class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                      />
                    </label>
                  }
                </div>

                <label class="block space-y-2">
                  <span class="text-sm font-semibold text-foreground">Correct answer</span>
                  <select
                    [name]="'question-correct-' + questionIndex"
                    [(ngModel)]="question.correctAnswer"
                    class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                  >
                    <option [ngValue]="0">Option 1</option>
                    <option [ngValue]="1">Option 2</option>
                    <option [ngValue]="2">Option 3</option>
                    <option [ngValue]="3">Option 4</option>
                  </select>
                </label>

                <div class="grid gap-4 md:grid-cols-2">
                  <label class="block space-y-2">
                    <span class="text-sm font-semibold text-foreground">Question difficulty</span>
                    <select
                      [name]="'question-difficulty-' + questionIndex"
                      [(ngModel)]="question.difficulty"
                      (ngModelChange)="onQuestionDifficultyChange(questionIndex, $event)"
                      class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                    >
                      <option *ngFor="let difficulty of difficultyOptions" [value]="difficulty">{{ difficulty }}</option>
                    </select>
                  </label>

                  <div class="block space-y-2">
                    <span class="text-sm font-semibold text-foreground">Auto weight</span>
                    <div class="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold text-teal-700">
                      Weight {{ question.weight ?? defaultQuestionWeight(question.difficulty ?? draft.difficulty) }}
                    </div>
                  </div>
                </div>

                <label class="block space-y-2">
                  <span class="text-sm font-semibold text-foreground">Explanation</span>
                  <textarea
                    [name]="'question-explanation-' + questionIndex"
                    [(ngModel)]="question.explanation"
                    required
                    rows="3"
                    maxlength="260"
                    class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                  ></textarea>
                  <p class="text-xs text-muted-foreground">Add a short explanation for the correct answer.</p>
                </label>
              </div>
            }
          </div>

          @if (formError()) {
            <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ formError() }}
            </p>
          }

          <div class="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <a routerLink="/admin/quizzes" class="rounded-2xl border border-border px-5 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-muted">
              Cancel
            </a>
            <button type="submit" class="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
              Create quiz
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class AdminQuizCreateComponent {
  private data = inject(DataService);
  private router = inject(Router);

  formError = signal('');
  courseOptions = computed(() => {
    const usedCourseTitles = new Set(this.data.quizzes().map((item: Quiz) => item.course.trim().toLowerCase()));
    return this.data.trainings()
      .map((item: Training) => item.title)
      .filter((title) => !usedCourseTitles.has(title.trim().toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
  });
  difficultyOptions: Quiz['difficulty'][] = ['Beginner', 'Intermediate', 'Advanced'];
  statusOptions: Quiz['status'][] = ['Draft', 'Published', 'Archived'];
  categoryOptions = ['Speaking', 'Writing', 'Pronunciation', 'Business', 'Grammar', 'Vocabulary', 'Reading', 'Listening'];
  minPublishAt = this.defaultPublishAt();
  draft = this.createEmptyDraft();
  questionDrafts = signal<QuizQuestion[]>(this.createQuestionDrafts(this.draft.questions));

  readonly ArrowLeftIcon = ArrowLeft;

  onQuestionCountChange(value: number | string) {
    const count = Math.min(10, Math.max(3, Number(value) || 3));
    this.draft.questions = count;
    this.questionDrafts.update((current) => this.resizeQuestionDrafts(current, count));
  }

  onQuestionDifficultyChange(index: number, difficulty: Quiz['difficulty']) {
    this.questionDrafts.update((current) => current.map((question, questionIndex) =>
      questionIndex === index
        ? { ...question, difficulty, weight: this.defaultQuestionWeight(difficulty) }
        : question
    ));
  }

  async createQuiz(form: NgForm) {
    this.formError.set('');

    if (form.invalid) {
      this.formError.set('Please correct the highlighted fields before creating the quiz.');
      return;
    }

    if (!this.courseOptions().includes(this.draft.course)) {
      this.formError.set('Please select a valid course title.');
      return;
    }

    if (Number(this.draft.questions) < 3 || Number(this.draft.questions) > 10) {
      this.formError.set('A quiz must contain between 3 and 10 questions.');
      return;
    }

    if (Number(this.draft.passScore) < 70) {
      this.formError.set('Pass score must be at least 70%.');
      return;
    }

    if (this.draft.status === 'Published' && !this.draft.publishAt) {
      this.formError.set('Choose a publication date and time for a published quiz.');
      return;
    }

    if (this.draft.status === 'Published' && this.draft.publishAt < this.minPublishAt) {
      this.formError.set('The publication date and time must be now or later.');
      return;
    }

    const items = this.buildQuestionPayload();
    if (!items) {
      this.formError.set('Please complete every quiz question with 4 options and one correct answer.');
      return;
    }

    const quiz: Quiz = {
      id: Date.now(),
      title: this.draft.title.trim(),
      course: this.draft.course,
      category: this.draft.category,
      difficulty: this.draft.difficulty,
      questions: items.length,
      duration: this.draft.duration.trim(),
      passScore: Number(this.draft.passScore),
      status: this.draft.status,
      publishAt: this.draft.status === 'Published' && this.draft.publishAt ? new Date(this.draft.publishAt).toISOString() : null,
      items
    };

    try {
      await this.data.addQuiz(quiz);
      this.data.addNotification({
        title: 'Quiz created',
        message: `"${quiz.title}" was added to the quiz catalog.`,
        href: '/admin/quizzes'
      });
      await this.router.navigateByUrl('/admin/quizzes');
    } catch (error) {
      this.formError.set(this.extractErrorMessage(error));
    }
  }

  private createEmptyDraft() {
    return {
      title: '',
      course: '',
      category: '',
      difficulty: 'Beginner' as Quiz['difficulty'],
      questions: 3,
      duration: '',
      passScore: 70,
      status: 'Published' as Quiz['status'],
      publishAt: this.defaultPublishAt()
    };
  }

  private buildQuestionPayload() {
    const items = this.questionDrafts()
      .slice(0, this.draft.questions)
      .map((item, index) => ({
        id: `${Date.now()}-${index + 1}`,
        text: item.text.trim(),
        options: item.options.map((option: string) => option.trim()),
        correctAnswer: Number(item.correctAnswer),
        explanation: item.explanation.trim(),
        difficulty: item.difficulty ?? this.draft.difficulty,
        weight: item.weight ?? this.defaultQuestionWeight(item.difficulty ?? this.draft.difficulty)
      }));

    const isValid = items.every((item) =>
      item.text &&
      item.options.length === 4 &&
      item.options.every((option: string) => option) &&
      item.explanation &&
      item.correctAnswer >= 0 &&
      item.correctAnswer <= 3
    );

    return isValid ? items : null;
  }

  private createQuestionDrafts(count: number) {
    return Array.from({ length: count }, (_, index) => this.createQuestionDraft(index));
  }

  private resizeQuestionDrafts(current: QuizQuestion[], count: number) {
    return Array.from({ length: count }, (_, index) => current[index] ?? this.createQuestionDraft(index));
  }

  private createQuestionDraft(index: number): QuizQuestion {
    return {
      id: `draft-${index + 1}`,
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: this.draft.difficulty,
      weight: this.defaultQuestionWeight(this.draft.difficulty)
    };
  }

  defaultQuestionWeight(difficulty: Quiz['difficulty']) {
    switch (difficulty) {
      case 'Advanced':
        return 3;
      case 'Intermediate':
        return 2;
      default:
        return 1;
    }
  }

  private defaultPublishAt() {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  private extractErrorMessage(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      const message = typeof error.error?.message === 'string'
        ? error.error.message
        : typeof error.error?.error === 'string'
          ? error.error.error
          : '';

      if (message) {
        return message;
      }

      if (error.status === 400) {
        return 'Please complete every required field for the quiz and its questions.';
      }
    }

    return 'The quiz could not be created. Check that the backend services are running.';
  }
}
