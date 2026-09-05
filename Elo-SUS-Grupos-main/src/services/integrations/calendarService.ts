export interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    location: string;
    details?: string;
}

export const calendarService = {
    /**
     * Opens a Google Calendar event creation page.
     * @param event The event details.
     */
    addToCalendar: (event: CalendarEvent) => {
        const formatDate = (date: Date) => {
            return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        };

        const startStr = formatDate(event.start);
        const endStr = formatDate(event.end);

        const url = new URL("https://calendar.google.com/calendar/render");
        url.searchParams.append("action", "TEMPLATE");
        url.searchParams.append("text", event.title);
        url.searchParams.append("dates", `${startStr}/${endStr}`);
        url.searchParams.append("location", event.location);
        if (event.details) {
            url.searchParams.append("details", event.details);
        }

        window.open(url.toString(), '_blank');
    }
};
