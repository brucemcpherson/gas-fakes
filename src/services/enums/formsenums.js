import { newFakeGasenum} from "@mcpher/fake-gasenum";
export const Alignment = newFakeGasenum([
  "LEFT",
  "CENTER",
  "RIGHT"
])
export const DestinationType = newFakeGasenum([
  "FUSION_TABLE",
  "SPREADSHEET"
])
export const EmailCollectionType = newFakeGasenum([
  "DO_NOT_COLLECT",
  "VERIFIED",
  "RESPONDER_INPUT"
])
export const FeedbackType = newFakeGasenum([
  "CORRECT",
  "INCORRECT",
  "GENERAL"
])
export const FileTypeCategory = newFakeGasenum([
  "TEXT_DOCUMENT",
  "PRESENTATION",
  "SPREADSHEET",
  "DRAWING",
  "PDF",
  "IMAGE",
  "VIDEO",
  "AUDIO"
])
export const ItemType = newFakeGasenum([
  "CHECKBOX",
  "CHECKBOX_GRID",
  "DATE",
  "DATETIME",
  "DURATION",
  "GRID",
  "IMAGE",
  "LIST",
  "MULTIPLE_CHOICE",
  "PAGE_BREAK",
  "PARAGRAPH_TEXT",
  "RATING",
  "SCALE",
  "SECTION_HEADER",
  "TEXT",
  "TIME",
  "VIDEO",
  "FILE_UPLOAD",
  "UNSUPPORTED"
])
export const PageNavigationType = newFakeGasenum([
  "CONTINUE",
  "GO_TO_PAGE",
  "RESTART",
  "SUBMIT"
])
export const RatingIconType = newFakeGasenum([
  "STAR",
  "HEART",
  "THUMB_UP"
])