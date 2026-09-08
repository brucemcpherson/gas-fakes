import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';

import { initTests } from './testinit.js';
import { cachePerformance, wrapupTest, trasher, maketcal, createTrashCollector } from './testassist.js';

export const testCalendars = (pack) => {
  const toTrash = createTrashCollector();
  const { unit, fixes } = pack || initTests();


  unit.section("basic adv calendar props", t => {
    t.is(Calendar.toString(), "AdvancedServiceIdentifier{name=calendar, version=v3}")
    t.is(Calendar.getVersion(), "v3")

    Reflect.ownKeys(Calendar)
      .filter(f => is.string(f) && f.match(/^new/))
      .forEach(f => {
        t.true(is.function(Calendar[f]), `check ${f} is a function`);
        const method = Calendar[f];
        const ob = method();
        t.true(Reflect.ownKeys(ob).every(g => is.function(ob[g])), `all Calendar.${f}().subprops are functions`)
      });

    const resources = ['Acl', 'CalendarList', 'Calendars', 'Channels', 'Colors', 'Events', 'Freebusy', 'Settings'];
    resources.forEach(resource => {
      t.is(is(Calendar[resource]), "Object", `Calendar.${resource} should be an object`);
      t.is(Calendar.toString(), Calendar[resource].toString(), `Calendar.${resource} should have the correct toString()`);
    });

    if (Calendar.isFake) {cachePerformance () }

  })


  unit.section('CalendarApp general', (t) => {
    t.truthy(CalendarApp, 'CalendarApp should be defined');

    // Test a basic method
    t.truthy(CalendarApp.getDefaultCalendar(), 'getDefaultCalendar should return something');

    // Test some enums from calendarenums.js
    t.truthy(CalendarApp.Month, 'CalendarApp.Month should be defined');
    t.is(CalendarApp.Month.JANUARY.toString(), 'JANUARY', 'Month.JANUARY should be accessible');

    t.truthy(CalendarApp.Weekday, 'CalendarApp.Weekday should be defined');
    t.is(CalendarApp.Weekday.MONDAY.toString(), 'MONDAY', 'Weekday.MONDAY should be accessible');

    t.truthy(CalendarApp.Visibility, 'CalendarApp.Visibility should be defined');
    t.is(CalendarApp.Visibility.PRIVATE.toString(), 'PRIVATE', 'Visibility.PRIVATE should be accessible');
  });

  unit.section('Calendar Class Metadata', (t) => {
    const calendar = CalendarApp.getDefaultCalendar();
    t.truthy(calendar, 'Default calendar should exist');

    // In both fake and live environments, the ID should now be the canonical ID (email), not 'primary'
    // Session is usually available in fake environment too via the worker
    const expectedId = Session.getEffectiveUser().getEmail();
    t.is(calendar.getId(), expectedId, 'Default calendar ID should match user email');


    // now create a test calendar
    const { cal: testCalendar, calName: tname } = maketcal(toTrash, fixes, { nameSuffix: 'general' });
    t.truthy(testCalendar, 'Test calendar should exist');
    t.is(testCalendar.getName(), tname, 'Test calendar name should match');

    // Test setters and getters
    const originalName = testCalendar.getName();
    const testName = 'Test Calendar ' + Date.now();
    testCalendar.setName(testName);
    t.is(testCalendar.getName(), testName, 'Calendar name should be updated');

    const testDescription = 'Testing gas-fakes Calendar implementation';
    testCalendar.setDescription(testDescription);
    t.is(testCalendar.getDescription(), testDescription, 'Calendar description should be updated');

    const testTimeZone = 'UTC';
    testCalendar.setTimeZone(testTimeZone);
    t.is(testCalendar.getTimeZone(), testTimeZone, 'Calendar time zone should be updated');

    // Restore name (optional but good practice)
    testCalendar.setName(originalName);
  });


  unit.section('Calendar Class Properties', (t) => {
    // Create a calendar for testing properties
    const { cal } = maketcal(toTrash, fixes, { nameSuffix: 'general' });

    t.truthy(cal, 'Should create calendar for prop test');

    // Test Color - original color is sometimes undefined for a new calendar
    const originalColor = cal.getColor();

    // in live app script, we can set any color using a hex string, 
    const newColor = '#ff0000'; // Red - but not a color in the calendar palette
    cal.setColor(newColor);
    t.is(cal.getColor()?.toUpperCase(), newColor.toUpperCase(), 'Should set and get color');

    // now try using a hex code that is a real color id
    const realColor = CalendarApp.Color.RED.toString()
    cal.setColor(realColor);
    t.is(cal.getColor()?.toUpperCase(), realColor.toUpperCase(), 'Should set and get color');

    // now try an enum
    const enumColor = CalendarApp.Color.MUSTARD;
    const enumColorStr = enumColor.toString();
    cal.setColor(enumColor);
    t.is(cal.getColor()?.toUpperCase(), enumColorStr.toUpperCase(), 'Should set and get color');

    // Test Hidden
    cal.setHidden(true);
    t.is(cal.isHidden(), true, 'Should be hidden');
    cal.setHidden(false);
    t.is(cal.isHidden(), false, 'Should be visible');

    // Test Selected
    cal.setSelected(true);
    t.is(cal.isSelected(), true, 'Should be selected');
    cal.setSelected(false);
    t.is(cal.isSelected(), false, 'Should not be selected');
  });

  unit.section('Calendar Events Creation', (t) => {
    const { cal } = maketcal(toTrash, fixes, { nameSuffix: 'general' });

    const now = new Date();
    const later = new Date(now.getTime() + 3600000); // 1 hour later

    // createEvent
    const event = cal.createEvent('Test Event', now, later);
    t.truthy(event, 'Should create event');
    t.is(event.getTitle(), 'Test Event', 'Title should match');
    t.is(event.getId().length > 0, true, 'Event should have ID');

    // createEvent with options
    const event2 = cal.createEvent('Test Event Options', now, later, { description: 'Desc', location: 'Loc' });
    t.is(event2.getTitle(), 'Test Event Options', 'Title with options should match');
    // We can't verify description/location easily without getEventById or checking resource if getTitle() is all we have.
    // But we trust FakeCalendar passes it to resource.

    // createAllDayEvent (single day)
    const adEvent = cal.createAllDayEvent('All Day', now);
    t.truthy(adEvent, 'Should create all day event');
    t.is(adEvent.getTitle(), 'All Day');

    // createAllDayEvent (range)
    const tomorrow = new Date(now.getTime() + 24 * 3600000);
    const adEvent2 = cal.createAllDayEvent('All Day Range', now, tomorrow);
    t.truthy(adEvent2, 'Should create all day event range');
    t.is(adEvent2.getTitle(), 'All Day Range');

    // * can be date or time
    const rx = /Event start .* must be before event end/;
    t.rxMatch(t.threw(() => cal.createEvent('Fail Event', later, now))?.message, rx,
      'Should throw correct error message for createEvent');

    t.rxMatch(t.threw(() => cal.createAllDayEvent('Fail All Day', tomorrow, now))?.message, rx,
      'Should throw correct error message for createAllDayEvent');

    // createEventFromDescription
    const quickEvent = cal.createEventFromDescription('Lunch with Bob tomorrow at 12pm');
    t.truthy(quickEvent, 'Should create event from description');

    const colorid = CalendarApp.EventColor.CYAN;
    const colorIdString = colorid.toString();
    quickEvent.setColor(colorid)
    t.is(quickEvent.getColor(), colorIdString, 'Color ID should match');

  });

  unit.section('Calendar Events Retrieval', (t) => {
    const { cal } = maketcal(toTrash, fixes, { nameSuffix: 'general' });

    const now = new Date();
    const later = new Date(now.getTime() + 3600000);

    const title = 'Find Me ' + Date.now();
    const event = cal.createEvent(title, now, later);

    // getEvents
    // Search window must cover the event
    const events = cal.getEvents(new Date(now.getTime() - 1000), new Date(later.getTime() + 1000));
    t.truthy(events.length >= 1, 'Should find at least one event');
    const found = events.find(e => e.getTitle() === title);
    t.truthy(found, 'Should find specific event in list');

    // getEventById
    const byId = cal.getEventById(event.getId());
    t.truthy(byId, 'Should find event by ID');
    t.is(byId.getTitle(), title, 'Found event should have correct title');

    // getEventsForDay
    const dayEvents = cal.getEventsForDay(now);
    const foundInDay = dayEvents.find(e => e.getTitle() === title);
    t.truthy(foundInDay, 'Should find event in day view');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testCalendars);