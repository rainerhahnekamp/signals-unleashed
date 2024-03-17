import { provideHolidays } from '@app/holidays/data';
import { HolidaysComponent } from '@app/holidays/feat-overview';
import { RequestInfoComponent } from '@app/holidays/feat-brochure';
import { QuizComponent } from '@app/holidays/feat-quiz';

export default [
  {
    path: '',
    providers: [provideHolidays()],
    children: [
      {
        path: '',
        component: HolidaysComponent,
      },
      {
        path: 'request-info/:holidayId',
        component: RequestInfoComponent,
      },
      {
        path: 'quiz/:id',
        component: QuizComponent,
      },
    ],
  },
];
