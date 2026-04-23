import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Image as ImageIcon, Upload } from 'lucide-angular';
import { DataService, Training, TrainingChapter, TrainingStatus, TrainingType } from '../../services/data.service';

@Component({
  selector: 'app-admin-course-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="space-y-2">
          <a routerLink="/admin/courses" class="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:underline">
            <lucide-icon [name]="ArrowLeftIcon" [size]="16"></lucide-icon>
            Back to courses
          </a>
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight">Create Course</h1>
            <p class="text-muted-foreground">Add a new course with content details and a custom image.</p>
          </div>
        </div>
      </div>

      <form #courseForm="ngForm" class="space-y-8" (ngSubmit)="createCourse(courseForm)">
        <div class="space-y-6 rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <label class="block space-y-2">
            <span class="text-sm font-semibold text-foreground">Course title</span>
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
            @if ((titleModel.touched || courseForm.submitted) && titleModel.invalid) {
              <p class="text-sm text-rose-600">
                @if (titleModel.errors?.['required']) { Course title is required. }
                @else if (titleModel.errors?.['minlength']) { Course title must be at least 5 characters. }
                @else if (titleModel.errors?.['maxlength']) { Course title must be under 120 characters. }
              </p>
            }
          </label>

          <label class="block space-y-2">
            <span class="text-sm font-semibold text-foreground">Description</span>
            <textarea
              name="description"
              #descriptionModel="ngModel"
              [(ngModel)]="draft.description"
              rows="6"
              required
              minlength="20"
              maxlength="800"
              class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            ></textarea>
            @if ((descriptionModel.touched || courseForm.submitted) && descriptionModel.invalid) {
              <p class="text-sm text-rose-600">
                @if (descriptionModel.errors?.['required']) { Description is required. }
                @else if (descriptionModel.errors?.['minlength']) { Description must be at least 20 characters. }
                @else if (descriptionModel.errors?.['maxlength']) { Description must be under 800 characters. }
              </p>
            }
          </label>

          <div class="grid gap-5 md:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Instructor</span>
              <input
                type="text"
                name="instructor"
                #instructorModel="ngModel"
                [(ngModel)]="draft.instructor"
                required
                minlength="3"
                maxlength="80"
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
              @if ((instructorModel.touched || courseForm.submitted) && instructorModel.invalid) {
                <p class="text-sm text-rose-600">
                  @if (instructorModel.errors?.['required']) { Instructor is required. }
                  @else if (instructorModel.errors?.['minlength']) { Instructor must be at least 3 characters. }
                  @else if (instructorModel.errors?.['maxlength']) { Instructor must be under 80 characters. }
                </p>
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
              @if ((categoryModel.touched || courseForm.submitted) && categoryModel.invalid) {
                <p class="text-sm text-rose-600">Please select a category.</p>
              }
            </label>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Course type</span>
              <select
                name="type"
                #typeModel="ngModel"
                [(ngModel)]="draft.type"
                required
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              >
                <option *ngFor="let type of typeOptions" [value]="type">{{ type }}</option>
              </select>
              @if ((typeModel.touched || courseForm.submitted) && typeModel.invalid) {
                <p class="text-sm text-rose-600">Please select a course type.</p>
              }
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Publishing status</span>
              <select
                name="status"
                #statusModel="ngModel"
                [(ngModel)]="draft.status"
                required
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              >
                <option *ngFor="let status of statusOptions" [value]="status">{{ status }}</option>
              </select>
              @if ((statusModel.touched || courseForm.submitted) && statusModel.invalid) {
                <p class="text-sm text-rose-600">Please select a publishing status.</p>
              }
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Level</span>
              <select
                name="level"
                #levelModel="ngModel"
                [(ngModel)]="draft.level"
                required
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Upper-intermediate">Upper-intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              @if ((levelModel.touched || courseForm.submitted) && levelModel.invalid) {
                <p class="text-sm text-rose-600">Please select a level.</p>
              }
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Chapters</span>
              <input
                type="number"
                name="chapters"
                #chaptersModel="ngModel"
                [(ngModel)]="draft.chapters"
                (ngModelChange)="syncChapterDrafts($event)"
                required
                min="1"
                max="5"
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
              @if ((chaptersModel.touched || courseForm.submitted) && chaptersModel.invalid) {
                <p class="text-sm text-rose-600">
                  @if (chaptersModel.errors?.['required']) { Chapters is required. }
                  @else if (chaptersModel.errors?.['min']) { Chapters must be at least 1. }
                  @else if (chaptersModel.errors?.['max']) { Chapters must be 5 or fewer. }
                </p>
              }
            </label>
          </div>

          <div class="grid gap-5 md:grid-cols-1">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-foreground">Duration</span>
              <input
                type="text"
                name="duration"
                #durationModel="ngModel"
                [(ngModel)]="draft.duration"
                placeholder="e.g. 6 weeks"
                required
                pattern="^[0-9]+\\s+(day|days|week|weeks|month|months)$"
                class="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
              @if ((durationModel.touched || courseForm.submitted) && durationModel.invalid) {
                <p class="text-sm text-rose-600">
                  @if (durationModel.errors?.['required']) { Duration is required. }
                  @else if (durationModel.errors?.['pattern']) { Use a format like "6 weeks" or "3 months". }
                </p>
              }
            </label>
          </div>

          <div class="space-y-4 rounded-[2rem] border border-border bg-muted/20 p-6">
            <div>
              <h2 class="font-bold text-foreground">Chapter content</h2>
              <p class="mt-2 text-sm text-muted-foreground">Upload one PDF for each chapter. This file will be shown when the learner clicks continue learning.</p>
            </div>

            @if (uploadingChapterLabel()) {
              <p class="text-sm text-teal-700">Uploading {{ uploadingChapterLabel() }}...</p>
            }

            @for (chapter of chapterDrafts(); track chapter.number) {
            <div class="rounded-2xl border border-border bg-white p-4">
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p class="text-sm font-semibold text-foreground">Chapter {{ chapter.number }}</p>
                  <p class="text-xs text-muted-foreground">{{ chapter.name }}</p>
                </div>

                <label class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
                  <lucide-icon [name]="UploadIcon" [size]="16"></lucide-icon>
                  Upload PDF
                  <input type="file" accept="application/pdf" class="hidden" (change)="onChapterPdfSelected(chapter.number - 1, $event)" />
                </label>
              </div>

              <p class="mt-3 text-xs text-muted-foreground">
                {{ chapter.pdfUrl ? 'PDF uploaded' : 'No PDF uploaded yet' }}
              </p>
            </div>
            }
          </div>

          <div class="rounded-[2rem] border border-dashed border-border bg-muted/20 p-6">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                <lucide-icon [name]="ImageIcon" [size]="22"></lucide-icon>
              </div>
              <div>
                <h2 class="font-bold text-foreground">Course cover</h2>
                <p class="text-sm text-muted-foreground">Upload the image that will be used as the course cover.</p>
              </div>
            </div>

            <label class="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">
              <lucide-icon [name]="UploadIcon" [size]="16"></lucide-icon>
              Upload cover image
              <input type="file" accept="image/*" class="hidden" (change)="onImageSelected($event)" />
            </label>
            @if (uploadingCover()) {
              <p class="mt-3 text-sm text-teal-700">Uploading cover image...</p>
            }
            @if (coverError()) {
              <p class="mt-3 text-sm text-rose-600">{{ coverError() }}</p>
            } @else if (courseForm.submitted && !draft.image) {
              <p class="mt-3 text-sm text-rose-600">Course cover is required.</p>
            }

            <div class="mt-5 overflow-hidden rounded-[1.5rem] border border-border bg-white">
              @if (draft.image) {
                <img [src]="draft.image" alt="Course preview" class="h-72 w-full object-cover" />
              } @else {
                <div class="flex h-72 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                  <lucide-icon [name]="ImageIcon" [size]="28"></lucide-icon>
                  <p class="max-w-xs text-sm">Your uploaded image preview will appear here.</p>
                </div>
              }
            </div>
          </div>

          @if (formError()) {
            <p class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ formError() }}
            </p>
          }

          <div class="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <a routerLink="/admin/courses" class="rounded-2xl border border-border px-5 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-muted">
              Cancel
            </a>
            <button type="submit" class="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
              Create course
            </button>
          </div>
        </div>
      </form>

      <div class="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <h2 class="font-bold text-foreground">Publishing notes</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
          The course is saved immediately to the current data set and will appear in the admin listing right after creation.
        </p>
      </div>
    </div>
  `
})
export class AdminCourseCreateComponent {
  private data = inject(DataService);
  private router = inject(Router);

  formError = signal('');
  coverError = signal('');
  uploadingCover = signal(false);
  uploadingChapterLabel = signal('');
  draft = this.createEmptyDraft();
  chapterDrafts = signal<TrainingChapter[]>(this.createChapterDrafts(1));
  typeOptions: TrainingType[] = ['Blended course', 'Live classes'];
  statusOptions: TrainingStatus[] = ['Published', 'Draft'];
  categoryOptions = [
    'Speaking',
    'Conversation',
    'Grammar',
    'Writing',
    'Reading',
    'Pronunciation',
    'Vocabulary',
    'Listening',
    'Business',
    'Business English',
    'Exam Preparation',
    'Kids English'
  ];

  readonly ArrowLeftIcon = ArrowLeft;
  readonly ImageIcon = ImageIcon;
  readonly UploadIcon = Upload;

  async onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.coverError.set('The course cover must be an image file.');
      input.value = '';
      return;
    }

    this.uploadingCover.set(true);
    try {
      const imageUrl = await this.data.uploadCourseCover(file);
      this.coverError.set('');
      this.draft.image = imageUrl;
    } catch (error) {
      this.coverError.set(this.getApiErrorMessage(error, 'The course cover could not be uploaded.'));
      input.value = '';
    } finally {
      this.uploadingCover.set(false);
    }
  }

  async onChapterPdfSelected(index: number, event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.formError.set('Each chapter file must be a PDF.');
      input.value = '';
      return;
    }

    const chapterNumber = index + 1;
    this.uploadingChapterLabel.set(`chapter ${chapterNumber} PDF`);
    try {
      const pdfUrl = await this.data.uploadCourseChapterPdf(file);
      this.formError.set('');
      this.chapterDrafts.update((chapters) =>
        chapters.map((chapter, chapterIndex) =>
          chapterIndex === index
            ? { ...chapter, pdfUrl }
            : chapter
        )
      );
    } catch (error) {
      this.formError.set(this.getApiErrorMessage(error, 'The chapter PDF could not be uploaded.'));
      input.value = '';
    } finally {
      this.uploadingChapterLabel.set('');
    }
  }

  syncChapterDrafts(value: number) {
    const count = Math.min(5, Math.max(1, Number(value) || 1));
    this.draft.chapters = count;
    this.chapterDrafts.update((current) => {
      const next = current.slice(0, count);
      while (next.length < count) {
        const number = next.length + 1;
        next.push({ name: `Chapter ${number}`, number, pdfUrl: '', sections: [] });
      }
      return next.map((chapter, index) => ({
        ...chapter,
        name: `Chapter ${index + 1}`,
        number: index + 1
      }));
    });
  }

  async createCourse(form: NgForm) {
    this.formError.set('');

    if (form.invalid) {
      this.formError.set('Please correct the highlighted fields before creating the course.');
      return;
    }

    const title = this.draft.title.trim();
    const description = this.draft.description.trim();
    const image = this.draft.image.trim();
    const slug = this.slugify(title);

    if (!title || !description || !slug || !this.draft.category.trim()) {
      this.formError.set('Title, description, and category are required.');
      return;
    }

    if (this.uploadingCover() || this.uploadingChapterLabel()) {
      this.formError.set('Please wait for uploads to finish before creating the course.');
      return;
    }

    if (!image || this.coverError()) {
      this.formError.set('Please upload a course cover image.');
      return;
    }

    if (this.chapterDrafts().some((chapter) => !chapter.pdfUrl)) {
      this.formError.set('Please upload one PDF for each chapter.');
      return;
    }

    const course: Training = {
      id: Date.now(),
      title,
      description,
      type: this.draft.type,
      status: this.draft.status,
      level: this.draft.level,
      price: 0,
      image,
      banner: image,
      slug,
      action: 'Enroll now',
      instructor: this.draft.instructor.trim(),
      category: this.draft.category.trim() || undefined,
      chapters: Number(this.draft.chapters),
      duration: this.draft.duration.trim(),
      chaptersData: this.chapterDrafts()
    };

    try {
      await this.data.addTraining(course);
      this.data.addNotification({
        title: 'Course created',
        message: `"${course.title}" was added to the course catalog.`,
        href: '/admin/courses'
      });
      await this.router.navigateByUrl('/admin/courses');
    } catch (error) {
      this.formError.set(this.getCreateCourseErrorMessage(error));
    }
  }

  private createEmptyDraft() {
    return {
      title: '',
      description: '',
      type: 'Blended course' as TrainingType,
      status: 'Draft' as TrainingStatus,
      level: 'Beginner',
      image: '',
      instructor: '',
      category: '',
      chapters: 1,
      duration: ''
    };
  }

  private createChapterDrafts(count: number) {
    return Array.from({ length: count }, (_, index) => ({
      name: `Chapter ${index + 1}`,
      number: index + 1,
      pdfUrl: '',
      sections: []
    }));
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getCreateCourseErrorMessage(error: unknown) {
    return this.getApiErrorMessage(error, 'The course could not be created. Check that the backend services are running.');
  }

  private getApiErrorMessage(error: unknown, fallback: string) {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error;
      const directMessage = typeof payload?.message === 'string'
        ? payload.message.trim()
        : typeof payload?.error === 'string'
          ? payload.error.trim()
          : '';
      if (directMessage) {
        return directMessage;
      }

      if (payload?.details && typeof payload.details === 'object') {
        const firstDetail = Object.values(payload.details).find((value) => typeof value === 'string');
        if (typeof firstDetail === 'string' && firstDetail.trim()) {
          return firstDetail.trim();
        }
      }
    }

    return fallback;
  }
}
