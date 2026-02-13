import { Proxies } from '../../support/proxies.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';
import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Syncit } from '../../support/syncit.js';

class FakeAdvDrivePermissions extends FakeAdvResource {
  constructor(drive) {
    // The service name is 'permissions', and it uses the main Drive sync method.
    super(drive, 'permissions', Syncit.fxDrive);
    this.__fakeObjectType = "Drive.Permissions";
    this.drive = drive;
    const props = ['get', 'update'];
    props.forEach(f => {
      if (!this[f]) {
        this[f] = () => notYetImplemented(f);
      }
    });
  }

  create(resource, fileId, optionalArgs) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Drive.Permissions.create");
    if (nargs < 2 || nargs > 3) matchThrow();

    ScriptApp.__behavior.isAccessible(fileId, 'Drive', 'write');
    const params = {
      resource,
      fileId,
      ...(optionalArgs || {})
    };
    const { data } = this._call('create', params);
    return data;
  }

  update(resource, fileId, permissionId, optionalArgs) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Drive.Permissions.update");
    if (nargs < 3 || nargs > 4) matchThrow();

    ScriptApp.__behavior.isAccessible(fileId, 'Drive', 'write');
    const params = {
      resource,
      fileId,
      permissionId,
      ...(optionalArgs || {})
    };
    const { data } = this._call('update', params);
    return data;
  }

  delete(fileId, permissionId, optionalArgs) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Drive.Permissions.delete");
    if (nargs < 2 || nargs > 3) matchThrow();

    ScriptApp.__behavior.isAccessible(fileId, 'Drive', 'write');
    const params = {
      fileId,
      permissionId,
      ...(optionalArgs || {})
    };
    // Delete returns an empty body on success, so we don't need to return anything.
    this._call('delete', params);
  }

  list(fileId, optionalArgs) {
    const { nargs, matchThrow } = signatureArgs(arguments, "Drive.Permissions.list");
    if (nargs < 1 || nargs > 2) matchThrow();

    ScriptApp.__behavior.isAccessible(fileId, 'Drive', 'read');
    const params = { fileId, ...(optionalArgs || {}) };
    const { data } = this._call('list', params);
    return data;
  }
}

export const newFakeAdvDrivePermissions = (...args) => Proxies.guard(new FakeAdvDrivePermissions(...args));