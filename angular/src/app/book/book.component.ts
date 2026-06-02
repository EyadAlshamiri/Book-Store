import { CoreModule, ListService, PagedResultDto } from '@abp/ng.core';
import { Component, OnInit, inject } from '@angular/core';
import { BookService, BookDto, bookTypeOptions } from '@proxy/books';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationService, Confirmation } from '@abp/ng.theme.shared';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss'],
  providers: [ListService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }],
  imports: [BaseThemeSharedModule, CoreModule, NgbDropdownModule],
})
export class BookComponent implements OnInit {
  book = { items: [], totalCount: 0 } as PagedResultDto<BookDto>;

  selectedBook = {} as BookDto;

  form!: FormGroup;

  bookTypes = bookTypeOptions;

  isModalOpen = false;

  public readonly list = inject(ListService);
  private readonly bookService = inject(BookService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);

  ngOnInit() {
    this.buildForm();

    const bookStreamCreator = (query: any) => this.bookService.getList(query);

    this.list.hookToQuery(bookStreamCreator).subscribe(response => {
      this.book = response;
    });
  }

  createBook() {
    this.selectedBook = {} as BookDto;
    this.buildForm();
    this.isModalOpen = true;
  }

  editBook(id: string) {
    this.bookService.get(id).subscribe(book => {
      this.selectedBook = book;
      this.buildForm();
      this.isModalOpen = true;
    });
  }

  buildForm() {
    this.form = this.fb.group({
      name: [this.selectedBook.name || '', Validators.required],
      type: [this.selectedBook.type ?? null, Validators.required],
      publishDate: [
        this.selectedBook.publishDate ? new Date(this.selectedBook.publishDate) : null,
        Validators.required,
      ],
      price: [this.selectedBook.price ?? null, Validators.required],
    });
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    const rawValues = {
      ...this.form.value,
    };

    if (rawValues.publishDate) {
      rawValues.publishDate = new Date(rawValues.publishDate);
    }

    const request = this.selectedBook.id
      ? this.bookService.update(this.selectedBook.id, rawValues)
      : this.bookService.create(rawValues);

    request.subscribe(() => {
      this.isModalOpen = false;
      this.form.reset();
      this.selectedBook = {} as BookDto;
      this.list.get();
    });
  }

  // Add a delete method
  delete(id: string) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe(status => {
      if (status === Confirmation.Status.confirm) {
        this.bookService.delete(id).subscribe(() => this.list.get());
      }
    });
  }
}
