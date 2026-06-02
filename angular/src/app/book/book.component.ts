import { CoreModule, ListService, PagedResultDto } from '@abp/ng.core';
import { Component, OnInit, inject } from '@angular/core';
import { BookService, BookDto } from '@proxy/books';
import { BaseThemeSharedModule } from '@abp/ng.theme.shared';
import { bookTypeOptions } from '@proxy/books'; // add bookTypeOptions
import { FormGroup, FormBuilder, Validators } from '@angular/forms'; // add this

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss'],
  providers: [ListService],
  imports: [BaseThemeSharedModule, CoreModule],
})
export class BookComponent implements OnInit {
  book = { items: [], totalCount: 0 } as PagedResultDto<BookDto>;
  form!: FormGroup; // add this line

  // add bookTypes as a list of BookType enum members
  bookTypes = bookTypeOptions;

  isModalOpen = false;

  public readonly list = inject(ListService);
  private readonly bookService = inject(BookService);
  private readonly fb = inject(FormBuilder);

  ngOnInit() {
    this.buildForm();
    const bookStreamCreator = (query: any) => this.bookService.getList(query);

    this.list.hookToQuery(bookStreamCreator).subscribe(response => {
      this.book = response;
    });
  }

  // add new method
  createBook() {
    this.form.reset();
    this.isModalOpen = true;
  }

  // add buildForm method
  buildForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: [null, Validators.required],
      publishDate: [null, Validators.required],
      price: [null, Validators.required],
    });
  }

  // add save method
  save() {
    if (!this.form || this.form.invalid) {
      console.log('Form is invalid');
      return;
    }
    console.log('Form is valid, proceeding to save');

    const rawValues = this.form.value;

    if (rawValues.publishDate) {
      rawValues.publishDate = new Date(rawValues.publishDate);
    }

    this.bookService.create(rawValues).subscribe(() => {
      this.isModalOpen = false;
      this.form.reset();
      this.list.get();
    });
  }
}
