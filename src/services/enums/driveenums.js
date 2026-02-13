import { newFakeGasenum } from "@mcpher/fake-gasenum";

export const Access = newFakeGasenum([
  "ANYONE",
  "ANYONE_WITH_LINK",
  "DOMAIN",
  "DOMAIN_WITH_LINK",
  "PRIVATE"
])

export const Permission = newFakeGasenum([
  "COMMENT",
  "EDIT",
  "NONE",
  "ORGANIZER",
  "OWNER",
  "READ",
  "VIEW"
])
