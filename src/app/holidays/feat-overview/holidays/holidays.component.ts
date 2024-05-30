import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { AsyncPipe, NgForOf } from '@angular/common';
import { HolidayCardComponent } from '@app/holidays/ui';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatButton } from '@angular/material/button';
import {
  HolidaysService,
  Holiday,
  HolidayType,
} from '@app/holidays/data/holidays-service';
import { interval } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-holidays',
  template: `<h2>Choose among our Holidays</h2>
    <form (ngSubmit)="search()">
      <div class="flex items-baseline">
        <mat-form-field>
          <mat-label>Search</mat-label>
          <input
            data-testid="inp-query"
            [(ngModel)]="query"
            matInput
            name="search"
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-radio-group
          [(ngModel)]="type"
          name="type"
          color="primary"
          class="mx-4"
        >
          <mat-radio-button value="all">All</mat-radio-button>
          <mat-radio-button value="city">City</mat-radio-button>
          <mat-radio-button value="country">Country</mat-radio-button>
        </mat-radio-group>
        <button color="primary" mat-raised-button>Search</button>
      </div>
    </form>

    <div>
      <p>{{ prettySearch() }}</p>
      <p>{{ holidaysCount() }}</p>
      <p>{{ selectedHoliday() }}</p>
      <p>Current Time: {{ prettyTime() }}</p>
      <p>Current Time: {{ prettyTime$ | async }}</p>
    </div>

    <div class="flex flex-wrap justify-evenly">
      @for (holiday of holidays(); track holiday.id) {
        <app-holiday-card
          [holiday]="holiday"
          (addFavourite)="addFavourite($event)"
          (removeFavourite)="removeFavourite($event)"
          [(selected)]="selectedHolidayId"
        >
        </app-holiday-card>
      }
    </div> `,
  standalone: true,
  imports: [
    AsyncPipe,
    HolidayCardComponent,
    NgForOf,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioGroup,
    MatRadioButton,
    MatButton,
  ],
})
export class HolidaysComponent {
  holidaysService = inject(HolidaysService);

  query = signal('');
  type = signal<HolidayType>('all');
  holidays = signal<Holiday[]>([]);

  prettySearch = computed(
    () => `Query: ${this.query()} with type ${this.type()}`,
  );
  holidaysCount = computed(() => {
    return `Found holidays: ${this.holidays().length}`;
  });
  injector = inject(Injector);
  destroyRef = inject(DestroyRef);

  selectedHolidayId = signal(1);

  now = toSignal(
    interval(1000).pipe(
      tap(console.log),
      map(() => new Date()),
    ),
    { initialValue: new Date() },
  );
  prettyTime = computed(() => this.now()?.toLocaleTimeString());
  prettyTime$ = toObservable(this.prettyTime);
  selectedHoliday = computed(() => {
    const holidays = this.holidays();
    const holidayId = this.selectedHolidayId();

    const holiday = holidays.find((entity) => entity.id === holidayId);

    if (!holiday) {
      return '';
    }

    return `Your current selection: ${holiday.title}`;
  });

  ngForm = viewChild.required(NgForm);

  constructor() {
    effect(() => {
      this.ngForm();

      untracked(() => this.search());
    });
  }

  async search() {
    if (this.ngForm().form.valid) {
      const holidays = await this.holidaysService.find(
        this.query(),
        this.type(),
      );
      this.holidays.set(holidays);
    }
  }

  addFavourite(id: number) {
    this.holidaysService.addFavourite(id);
    this.setFavouriteLocally(id, true);
  }

  removeFavourite(id: number) {
    this.holidaysService.removeFavourite(id);
    this.setFavouriteLocally(id, false);
  }

  private setFavouriteLocally(id: number, isFavourite: boolean) {
    this.holidays.update((holidays) =>
      holidays.map((holiday) =>
        holiday.id === id
          ? { ...holiday, isFavourite: isFavourite }
          : holiday,
      ),
    );
  }
}
