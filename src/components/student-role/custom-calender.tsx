"use client";
import { useState, type JSX } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { APP_TIMEZONE, getISTParts } from '@/lib/utils';

interface CourseData {
  courseId: string;
  courseName: string;
  courseStartDate: string;
  courseEndDate: string;
  courseLanguage: string;
  courseStatus: boolean;
  courseProgres: number;
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Dashboard month calendar. Every calendar-day computation (viewed month,
 * grid cells, "today" highlight, event day matching) is pinned to the app
 * timezone (Asia/Kolkata) via getISTParts dayKeys, so the calendar looks
 * identical for every user no matter which timezone their device runs in.
 *
 * Layout: both the weekday header and the day cells are 7-column CSS grids
 * with the same gap, and cells stretch to fill their track (no fixed
 * widths), so columns always line up and never overlap at any viewport.
 */
const CalendarLayout = ({ Courses }: { Courses: CourseData[] }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const events = Courses.flatMap(course => [
    {
      title: `${course.courseName} Start`,
      date: new Date(course.courseStartDate.split('/').reverse().join('-')),
      type: 'start'
    },
    {
      title: `${course.courseName} End`,
      date: new Date(course.courseEndDate.split('/').reverse().join('-')),
      type: 'end'
    }
  ]);

  /** Stable Asia/Kolkata "YYYY-MM-DD" key for any instant. */
  const dayKeyOf = (date: Date): string | undefined =>
    getISTParts(date)?.dayKey;

  // The viewed month is the IST calendar month of the anchor instant
  const viewParts = getISTParts(currentDate);
  if (!viewParts) return null;
  const viewYear = viewParts.year;
  const viewMonth0 = viewParts.month - 1; // 0-based for Date.UTC math

  // Month-grid helpers built on UTC-midnight anchors (their IST dayKey is
  // the same calendar day, since UTC midnight is 05:30 IST).
  const getDaysInMonth = (year: number, month0: number): number =>
    new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const getFirstDayOfMonth = (year: number, month0: number): number =>
    new Date(Date.UTC(year, month0, 1)).getUTCDay();

  const handleDateClick = (day: Date): void => {
    setSelectedDate(day);
  };

  const renderDays = (): JSX.Element[] => {
    const days: JSX.Element[] = [];
    const daysInMonth = getDaysInMonth(viewYear, viewMonth0);
    const firstDayOfMonth = getFirstDayOfMonth(viewYear, viewMonth0);
    const todayKey = dayKeyOf(new Date());

    // Leading blanks (days before the 1st)
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          aria-hidden="true"
          className="h-24 border bg-violet-100 dark:bg-violet-900/20"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(viewYear, viewMonth0, day));
      const dayKey = dayKeyOf(date);
      const isSelected = !!selectedDate && dayKey === dayKeyOf(selectedDate);
      const isCurrentDate = dayKey === todayKey;
      const isSunday = date.getUTCDay() === 0;

      const dayEvents = events.filter((event) => dayKeyOf(event.date) === dayKey);
      const hasStart = dayEvents.some(event => event.type === 'start');
      const hasEnd = dayEvents.some(event => event.type === 'end');

      // Style precedence: event > today > sunday > default.
      let cellStyle: string;
      if (hasStart) {
        cellStyle = 'border-green-600 bg-green-500 text-white';
      } else if (hasEnd) {
        cellStyle = 'border-red-600 bg-red-500 text-white';
      } else if (isCurrentDate) {
        cellStyle = 'border-primary bg-primary text-white';
      } else if (isSunday) {
        cellStyle = 'border-violet-200 bg-violet-100 text-violet-900 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-200';
      } else {
        cellStyle = 'hover:bg-violet-50 dark:hover:bg-violet-900/20';
      }

      days.push(
        <div
          key={day}
          className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden border p-1 font-bold transition-colors ${cellStyle} ${isSelected && !isCurrentDate ? 'ring-2 ring-inset ring-violet-500' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          <div className="day-number text-center">{day}</div>
          {dayEvents.length > 0 && (
            <div className="events flex w-full flex-col items-center gap-0.5">
              {dayEvents.map((event, index) => (
                <div
                  key={index}
                  title={event.title}
                  className="event w-full truncate rounded-sm bg-white/20 px-1 py-0.5 text-center text-[11px] font-medium leading-tight"
                >
                  {event.title}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Trailing blanks so the last row is always complete
    const totalCells = firstDayOfMonth + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
      days.push(
        <div
          key={`tail-${i}`}
          aria-hidden="true"
          className="h-24 border bg-violet-100 dark:bg-violet-900/20"
        />
      );
    }

    return days;
  };

  return (
    <div className="calendar-container mx-auto m-4 w-full rounded-md border bg-card p-4 shadow-lg">
      <div className="header flex flex-row items-center gap-2 text-primary p-2 pb-4 w-full">
        <h2 className="m-0 flex-1 border p-2 text-lg font-bold">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: APP_TIMEZONE })}
        </h2>
        <button onClick={() => setCurrentDate(new Date(Date.UTC(viewYear, viewMonth0 - 1, 1)))}
          aria-label="Previous month"
          className="border px-2 py-1 text-primary rounded cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/30">
          <ChevronLeft className='h-6 w-6' />
        </button>
        <button onClick={() => setCurrentDate(new Date(Date.UTC(viewYear, viewMonth0 + 1, 1)))}
          aria-label="Next month"
          className="border px-2 py-1 text-primary rounded cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/30">
          <ChevronRight className='h-6 w-6' />
        </button>
      </div>
      <div className="days-of-week grid grid-cols-7 gap-1 w-full">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="day-of-week border-2 border-primary bg-primary/5 py-1 text-center font-bold text-primary">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-days mt-1 grid grid-cols-7 gap-1 w-full">
        {renderDays()}
      </div>
    </div>
  );
};

export default CalendarLayout;
