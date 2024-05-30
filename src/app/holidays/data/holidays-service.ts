import { inject, Injectable } from '@angular/core';
import { holidays as rawHolidays } from '@app/holidays/data/holiday-data';
import { Holiday as HolidayEntity } from '@app/holidays/model';
import { LoadingService } from '@app/shared/ui-messaging';

export type HolidayType = 'all' | 'city' | 'country';
export type Holiday = HolidayEntity & { isFavourite: boolean };

@Injectable({ providedIn: 'root' })
export class HolidaysService {
  holidays = rawHolidays.map((holiday) => ({ ...holiday, isFavourite: false }));
  loadingService = inject(LoadingService);
  typeMap: Record<HolidayType, number> = { all: 0, city: 1, country: 2 };

  find(query: string, type: HolidayType): Promise<Holiday[]> {
    const filteredHolidays = this.holidays
      .filter(
        (holiday) => !query || holiday.title.match(new RegExp(query, 'i')),
      )
      .filter(
        (holiday) => type === 'all' || holiday.typeId !== this.typeMap[type],
      );

    this.loadingService.start();
    return new Promise<Holiday[]>((resolve) => {
      setTimeout(() => {
        this.loadingService.stop();
        resolve(filteredHolidays);
      });
    });
  }

  addFavourite(id: number): void {
    this.setFavorite(id, true);
  }

  removeFavourite(id: number): void {
    this.setFavorite(id, false);
  }

  private setFavorite(id: number, isFavourite: boolean) {
    this.holidays = this.holidays.map((holiday) =>
      holiday.id === id
        ? { ...holiday, isFavourite: isFavourite }
        : holiday,
    );
  }
}
