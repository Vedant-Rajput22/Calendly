export type EventType = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string | null;
  durationMins: number;
  color: string;
  isActive: boolean;
  bufferBeforeMins: number;
  bufferAfterMins: number;
};

export type AvailabilityWindow = {
  id?: string;
  availabilityId?: string;
  startTime: string;
  endTime: string;
  sortOrder?: number;
};

export type AvailabilityDay = {
  id: string;
  userId: string;
  dayOfWeek: number;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  windows?: AvailabilityWindow[];
};

export type AvailabilityResponse = {
  timezone: string;
  days: AvailabilityDay[];
};

export type DateOverride = {
  id: string;
  userId: string;
  date: string;
  isBlocked: boolean;
  startTime: string | null;
  endTime: string | null;
};

export type Booking = {
  id: string;
  eventTypeId: string;
  inviteeName: string;
  inviteeEmail: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: string;
  cancelToken: string;
  meetingUrl?: string | null;
  isOrganizer?: boolean;
  organizerName?: string;
  organizerEmail?: string | null;
  eventType: {
    name: string;
    slug: string;
    color: string;
    durationMins: number;
  };
};
