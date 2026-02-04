import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';
import { initTests } from './testinit.js';
import { wrapupTest, compareValue, maketcal, trasher } from './testassist.js';


export const testCalendarSandbox = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  // only sandbox tests in fakes
  if (ScriptApp.isFake) {
    unit.section('Calendar Management', (t) => {
      // Test creating a new calendar
      const { cal: newCal, calName: newName } = maketcal(toTrash, fixes, { nameSuffix: 'sandbox-A' });
      t.truthy(newCal, 'Created calendar should exist');
      t.is(newCal.getName(), newName, 'New calendar name should match');

      // Test listing calendars
      const allCals = CalendarApp.getAllCalendars();
      t.truthy(allCals.length > 0, 'Should have at least one calendar');
      const found = allCals.find(c => c.getName() === newName);
      t.truthy(found, 'Created calendar should be found in all calendars');

      const ownedCals = CalendarApp.getAllOwnedCalendars();
      t.truthy(ownedCals.length > 0, 'Should have at least one owned calendar');

      const byName = CalendarApp.getCalendarsByName(newName);
      t.is(byName.length, 1, 'Should find one calendar by name');
      t.is(byName[0].getId(), newCal.getId(), 'Found calendar ID should match');
    });


    unit.section('Calendar Sandbox - Whitelist Access', (t) => {
      // Save current sandbox state
      const behavior = ScriptApp.__behavior;
      const originalSandboxMode = behavior.sandboxMode;
      const calendarSettings = behavior.sandboxService.CalendarApp;
      const originalWhitelist = calendarSettings.calendarWhitelist;

      try {
        // Enable sandbox mode
        behavior.sandboxMode = true;

        // Create a test calendar that will be in the whitelist
        const { cal: whitelistedCal } = maketcal(toTrash, fixes, { nameSuffix: 'sandbox-A' });
        const whitelistedName = whitelistedCal.getName();
        t.truthy(whitelistedCal, 'Should create whitelisted calendar');

        // Create another calendar that won't be in the whitelist
        const { cal: restrictedCal } = maketcal(toTrash, fixes, { nameSuffix: 'sandbox-B' });
        const restrictedName = restrictedCal.getName();
        t.truthy(restrictedCal, 'Should create restricted calendar');

        // Clear the session tracking to simulate external calendars
        behavior.resetCalendar();

        // Set up whitelist
        calendarSettings.calendarWhitelist = [
          { name: whitelistedName, read: true, write: false },
          { name: 'Primary', read: true, write: true }
        ];

        // Test: Primary calendar should always be accessible
        const primary = CalendarApp.getDefaultCalendar();
        t.truthy(primary, 'Primary calendar should be accessible');
        t.is(primary.getId(), Session.getEffectiveUser().getEmail(), 'Should get primary calendar');

        // Test: Whitelisted calendar should be readable
        const foundWhitelisted = CalendarApp.getCalendarsByName(whitelistedName);
        t.is(foundWhitelisted.length, 1, 'Should find whitelisted calendar');

        // Test: Restricted calendar should not be accessible
        const foundRestricted = CalendarApp.getCalendarsByName(restrictedName);
        t.is(foundRestricted.length, 0, 'Should not find restricted calendar');

        // Test: getAllCalendars should only return accessible calendars
        const allCals = CalendarApp.getAllCalendars();
        const hasWhitelisted = allCals.some(c => c.getName() === whitelistedName);
        const hasRestricted = allCals.some(c => c.getName() === restrictedName);
        t.truthy(hasWhitelisted, 'getAllCalendars should include whitelisted calendar');
        t.is(hasRestricted, false, 'getAllCalendars should not include restricted calendar');

      } finally {
        // Restore original state
        behavior.sandboxMode = originalSandboxMode;
        calendarSettings.calendarWhitelist = originalWhitelist;
      }
    });

    unit.section('Calendar Sandbox - Write Permissions', (t) => {
      const behavior = ScriptApp.__behavior;
      const originalSandboxMode = behavior.sandboxMode;
      const calendarSettings = behavior.sandboxService.CalendarApp;
      const originalWhitelist = calendarSettings.calendarWhitelist;

      try {
        behavior.sandboxMode = true;

        // Create test calendars
        const { cal: readOnlyCal } = maketcal(toTrash, fixes, { nameSuffix: 'sandbox-A' });
        const readOnlyName = readOnlyCal.getName();

        const { cal: writableCal } = maketcal(toTrash, fixes, { nameSuffix: 'sandbox-B' });
        const writableName = writableCal.getName();

        // Clear session tracking
        behavior.resetCalendar();

        // Set up whitelist with different permissions
        calendarSettings.calendarWhitelist = [
          { name: readOnlyName, read: true, write: false },
          { name: writableName, read: true, write: true }
        ];

        // Test: Read-only calendar should reject writes
        const readOnlyCals = CalendarApp.getCalendarsByName(readOnlyName);
        t.is(readOnlyCals.length, 1, 'Should find read-only calendar');

        try {
          readOnlyCals[0].setDescription('Should fail');
          t.fail('Should not allow write to read-only calendar');
        } catch (e) {
          t.truthy(e.message.includes('denied'), 'Should throw access denied error');
        }

        // Test: Writable calendar should allow writes
        const writableCals = CalendarApp.getCalendarsByName(writableName);
        t.is(writableCals.length, 1, 'Should find writable calendar');

        writableCals[0].setDescription('Should succeed');
        t.is(writableCals[0].getDescription(), 'Should succeed', 'Should update writable calendar');

      } finally {
        behavior.sandboxMode = originalSandboxMode;
        calendarSettings.calendarWhitelist = originalWhitelist;
      }
    });

    unit.section('Calendar Sandbox - Usage Limits', (t) => {
      const behavior = ScriptApp.__behavior;
      const originalSandboxMode = behavior.sandboxMode;
      const calendarSettings = behavior.sandboxService.CalendarApp;
      const originalLimit = calendarSettings.usageLimit;
      const originalWhitelist = calendarSettings.calendarWhitelist;

      try {
        behavior.sandboxMode = true;

        // Create a test calendar
        const { cal: testCal, calName: testName } = maketcal(toTrash, fixes, { nameSuffix: 'sandbox-A' });

        // Clear session and set up whitelist
        behavior.resetCalendar();
        calendarSettings.calendarWhitelist = [
          { name: testName, read: true, write: true }
        ];

        // Test: Granular read limit
        calendarSettings.usageLimit = { read: 2, write: 10 };
        calendarSettings.resetUsageCount();

        // First two reads should succeed
        CalendarApp.getCalendarsByName(testName);
        CalendarApp.getCalendarsByName(testName);

        // Third read should fail
        try {
          CalendarApp.getCalendarsByName(testName);
          t.fail('Should enforce read limit');
        } catch (e) {
          t.truthy(e.message.includes('usage limit'), 'Should throw usage limit error');
        }

        // Test: Total usage limit
        calendarSettings.usageLimit = 3; // Total limit
        calendarSettings.resetUsageCount();

        // Use up the limit with mixed operations
        CalendarApp.getAllCalendars(); // read: 1
        CalendarApp.getAllOwnedCalendars(); // read: 2
        CalendarApp.getCalendarsByName(testName); // read: 3

        // Next operation should fail
        try {
          CalendarApp.getAllCalendars(); // read: 4 - should fail
          t.fail('Should enforce total usage limit');
        } catch (e) {
          t.truthy(e.message.includes('usage limit'), 'Should throw total usage limit error');
        }

      } finally {
        behavior.sandboxMode = originalSandboxMode;
        calendarSettings.usageLimit = originalLimit;
        calendarSettings.calendarWhitelist = originalWhitelist;
        calendarSettings.resetUsageCount();
      }
    });

    unit.section('Calendar Sandbox - Session Calendars', (t) => {
      const behavior = ScriptApp.__behavior;
      const originalSandboxMode = behavior.sandboxMode;
      const calendarSettings = behavior.sandboxService.CalendarApp;
      const originalWhitelist = calendarSettings.calendarWhitelist;

      try {
        behavior.sandboxMode = true;

        // Set up empty whitelist
        calendarSettings.calendarWhitelist = [];

        // Test: Session-created calendars should be accessible even without whitelist
        const { cal: sessionCal, calName: sessionName } = maketcal(toTrash, fixes, { nameSuffix: 'sandbox-A' });
        t.truthy(sessionCal, 'Should create session calendar');

        // Should be able to read and write to session calendar
        sessionCal.setDescription('Session calendar description');
        t.is(sessionCal.getDescription(), 'Session calendar description', 'Should modify session calendar');

        // Should find it in listings
        const found = CalendarApp.getCalendarsByName(sessionName);
        t.is(found.length, 1, 'Should find session calendar in listings');

        const allCals = CalendarApp.getAllCalendars();
        const hasSession = allCals.some(c => c.getName() === sessionName);
        t.truthy(hasSession, 'getAllCalendars should include session calendar');

      } finally {
        behavior.sandboxMode = originalSandboxMode;
        calendarSettings.calendarWhitelist = originalWhitelist;
      }
    });

    unit.section('Calendar Sandbox - Method Whitelist', (t) => {
      const behavior = ScriptApp.__behavior;
      const originalSandboxMode = behavior.sandboxMode;
      const calendarSettings = behavior.sandboxService.CalendarApp;
      const originalMethodWhitelist = calendarSettings.methodWhitelist;

      try {
        behavior.sandboxMode = true;

        // Set up method whitelist - include getCalendarsByName for maketcal
        calendarSettings.setMethodWhitelist(['getDefaultCalendar', 'getCalendarById', 'createCalendar', 'getCalendarsByName']);

        // Test: Whitelisted methods should work
        const primary = CalendarApp.getDefaultCalendar();
        t.truthy(primary, 'Whitelisted method should work');

        const { cal: newCal } = maketcal(toTrash, fixes, { nameSuffix: 'sandbox-A' });
        t.truthy(newCal, 'Whitelisted createCalendar should work');

        // Test: Non-whitelisted methods should fail
        try {
          CalendarApp.getAllCalendars();
          t.fail('Non-whitelisted method should fail');
        } catch (e) {
          t.truthy(e.message.includes('not allowed'), 'Should throw method not allowed error');
        }

      } finally {
        behavior.sandboxMode = originalSandboxMode;
        calendarSettings.clearMethodWhitelist();
      }
    });

    unit.section('Calendar Event Sandbox', (t) => {
      const behavior = ScriptApp.__behavior;
      const originalSandboxMode = behavior.sandboxMode;
      const calendarSettings = behavior.sandboxService.CalendarApp;
      const gmailSettings = behavior.sandboxService.GmailApp;
      const originalCalWhitelist = calendarSettings.calendarWhitelist;
      const originalGmailWhitelist = gmailSettings.emailWhitelist;
      const originalUsageLimit = calendarSettings.usageLimit;

      try {
        behavior.sandboxMode = true;

        // Setup: Create a calendar and an event to test with
        const { cal, calName } = maketcal(toTrash, fixes, { nameSuffix: 'sandbox-A' });
        const event = cal.createEvent('Test Event', new Date(), new Date(new Date().getTime() + 3600000));

        // Clear session tracking so we rely on whitelist
        behavior.resetCalendar();

        // 1. Test Event Modification Permissions
        // Make calendar read-only
        calendarSettings.calendarWhitelist = [
          { name: calName, read: true, write: false }
        ];

        try {
          event.setTitle('New Title');
          t.fail('Should not allow setting title on read-only calendar event');
        } catch (e) {
          t.truthy(e.message.includes('denied'), 'Should throw access denied for setTitle');
        }

        // Make calendar writable
        calendarSettings.calendarWhitelist = [
          { name: calName, read: true, write: true }
        ];

        event.setTitle('New Title');
        t.is(event.getTitle(), 'New Title', 'Should allow setting title on writable calendar event');

        // 2. Test Guest Whitelist (Gmail integration)
        gmailSettings.emailWhitelist = ['friend@example.com'];

        try {
          event.addGuest('stranger@example.com');
          t.fail('Should not allow adding non-whitelisted guest');
        } catch (e) {
          t.truthy(e.message.includes('Gmail sandbox whitelist'), 'Should throw error for non-whitelisted guest');
        }

        event.addGuest('friend@example.com');
        // Verify guest added (fake implementation might just update resource, assumes API success)
        // We can't easily check attendees on fake event object unless we implemented getGuestList or check internal resource
        // But if no error thrown, we assume success for this test.

        // 3. Test Usage Limits on Events
        calendarSettings.usageLimit = { write: 2 };
        calendarSettings.resetUsageCount();

        event.setDescription('Desc 1'); // write 1
        event.setLocation('Loc 1');    // write 2

        try {
          event.setTitle('Fail Title'); // write 3
          t.fail('Should enforce write usage limit on event');
        } catch (e) {
          t.truthy(e.message.includes('usage limit'), 'Should throw usage limit error for event modification');
        }

      } finally {
        behavior.sandboxMode = originalSandboxMode;
        calendarSettings.calendarWhitelist = originalCalWhitelist;
        gmailSettings.emailWhitelist = originalGmailWhitelist;
        calendarSettings.usageLimit = originalUsageLimit;
        calendarSettings.resetUsageCount();
      }
    });

  } else {
    console.log('...skipping sandbox tests in live apps script environment');
  }

  // delete test calendars
  // Now handled by maketcal/cleanup but we ensure explicit cleanup if requested
  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit };
};


wrapupTest(testCalendarSandbox);

