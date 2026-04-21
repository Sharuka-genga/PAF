export type ResourceType =
  | 'LECTURE_HALL'
  | 'LAB'
  | 'MEETING_ROOM'
  | 'PROJECTOR'
  | 'CAMERA'
  | 'OTHER';

export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE' | 'MAINTENANCE';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface AvailabilityWindow {
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number | null;
  location: string;
  status: ResourceStatus;
  description: string | null;
  availabilityWindows: AvailabilityWindow[];
  createdAt: string;
  updatedAt: string;
}

export interface ResourceRequest {
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  capacity: number | null;
  location: string;
  description: string;
  availabilityWindows: AvailabilityWindow[];
}

export interface ResourceSearchParams {
  type?: ResourceType | '';
  minCapacity?: number | '';
  location?: string;
  status?: ResourceStatus | '';
}
