import { CoreModule, ListService, PagedResultDto } from '@abp/ng.core';
import { Component, OnInit, inject } from '@angular/core';
import { BookService, BookDto } from '@proxy/books';
import { BaseThemeSharedModule } from "@abp/ng.theme.shared";

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss'],
  providers: [ListService],
  imports: [BaseThemeSharedModule , CoreModule],
})
export class BookComponent implements OnInit {
  book = { items: [], totalCount: 0 } as PagedResultDto<BookDto>;

  public readonly list = inject(ListService);
  private readonly bookService = inject(BookService);

  ngOnInit() {
    const bookStreamCreator = (query: any) => this.bookService.getList(query);

    this.list.hookToQuery(bookStreamCreator).subscribe((response) => {
      this.book = response;
    });
  }
}
