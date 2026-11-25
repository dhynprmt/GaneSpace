import { MOCK_EVENTS } from "./events";

let sharedEvents = MOCK_EVENTS.map((e) => ({
  ...e,
  is_published: true,
}));

export const eventStore = {
  getAll: () => sharedEvents,
  setAll: (next) => {
    sharedEvents = next;
  },
  add: (event) => {
    sharedEvents = [event, ...sharedEvents];
    return event;
  },
  update: (id, patch) => {
    sharedEvents = sharedEvents.map((e) => (e.id === id ? { ...e, ...patch } : e));
    return sharedEvents.find((e) => e.id === id) || null;
  },
  remove: (id) => {
    sharedEvents = sharedEvents.filter((e) => e.id !== id);
  },
};