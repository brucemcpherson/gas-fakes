import { newKSuiteDrive } from "./kdrive.js";
import { isFolder } from "../helpers.js";

const getKSuiteDrive = async (Auth) => {
  const token = await Auth.getAccessToken();
  if (!token) {
    throw new Error("failed to get ksuite token");
  }
  const effectiveUser = await Auth.getEffectiveUser();
  if (!effectiveUser) {
    throw new Error("failed to get effective ksuite user");
  }
  const kDrive = newKSuiteDrive({ token, effectiveUser });
  return kDrive;
};

export const handleKSuiteDrive = async (Auth, { prop, method, params }) => {
  const kDrive = await getKSuiteDrive(Auth);

  // 1. Identify the target object instance
  const targetObj = prop ? kDrive[prop] : kDrive;

  // 2. Extract the method from that target object
  const fn = targetObj ? targetObj[method] : undefined;

  if (typeof fn !== "function") {
    throw new Error(
      `KSuite Drive API ${prop}.${method} not implemented in POC`,
    );
  }

  // 3. Invoke the function using .call() to preserve `this`
  return fn.call(targetObj, params);
};

export const handleKSuiteStream = async (
  Auth,
  { resource, bytes, fields, method, mimeType, fileId, params }
) => {
  const kDrive = await getKSuiteDrive(Auth);

  // Normalize fallback MIME type and parent ID
  const resolvedMimeType = mimeType || resource?.mimeType;
  const parentId = resource?.parents?.[0];
  const fileName = resource?.name || "Untitled";

  switch (method) {
    case "update":
      return kDrive.update(params);

    case "download": {
      const [data, meta] = await Promise.all([
        kDrive.downloadFile(fileId),
        kDrive.getFile(fileId),
      ]);
      return {
        // Return Buffer directly (or Uint8Array) instead of converting to JS Array to prevent memory spikes
        data: Buffer.isBuffer(data) ? data : Buffer.from(data),
        metadata: meta,
        response: { status: 200 },
      };
    }

    default: {
      // Handle Directory Creation
      const isDir = isFolder({ mimeType: resolvedMimeType });
      if (isDir) {
        const data = await kDrive.createDirectory(parentId, fileName);
        return {
          data,
          response: { status: 200 },
        };
      }

      // Handle Empty File Creation (No bytes provided or 0-length)
      const hasContent = bytes && (bytes.length > 0 || bytes.byteLength > 0);
      if (!hasContent && !fileId) {
        const data = await kDrive.createEmptyFile(parentId, fileName);
        return {
          data,
          response: { status: 200 },
        };
      }

      // Handle Full File Upload (including updates with fileId)
      const data = await kDrive.uploadFile(
        parentId,
        fileName,
        bytes,
        resolvedMimeType,
        fileId // Pass fileId so updates hit the correct file version
      );

      return {
        data,
        response: { status: 200 },
      };
    }
  }
};
