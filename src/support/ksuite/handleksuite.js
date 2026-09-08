import { newKSuiteDrive } from "./kdrive.js";
import { isFolder } from "../helpers.js";

const getKSuiteDrive = async (Auth) => {
  const token = await Auth.getAccessToken();
  if (!token) {
    throw new Error("Failed to get ksuite token");
  }
  const effectiveUser = await Auth.getEffectiveUser();
  if (!effectiveUser) {
    throw new Error("Failed to get effective ksuite user");
  }
  return newKSuiteDrive({ token, effectiveUser });
};

export const handleKSuiteDrive = async (Auth, { prop, method, params }) => {
  const kDrive = await getKSuiteDrive(Auth);

  // Identify target object (e.g. kDrive.files or kDrive.permissions)
  const targetObj = prop ? kDrive[prop] : kDrive;
  const fn = targetObj ? targetObj[method] : undefined;

  if (typeof fn !== "function") {
    throw new Error(
      `KSuite Drive API ${prop ? `${prop}.` : ""}${method} is not implemented`,
    );
  }

  return fn.call(targetObj, params);
};

export const handleKSuiteStream = async (
  Auth,
  { resource, bytes, method, mimeType, fileId, params }
) => {
  const kDrive = await getKSuiteDrive(Auth);
  const files = kDrive.files;

  const resolvedMimeType = mimeType || resource?.mimeType;
  const parentId = resource?.parents?.[0];
  const fileName = resource?.name || "Untitled";

  switch (method) {
    case "update":
      return files.update({ ...params, fileId, resource, bytes });

    case "download": {
      const [data, meta] = await Promise.all([
        files.downloadFile(fileId),
        files.getFile(fileId),
      ]);
      return {
        data: Buffer.isBuffer(data) ? data : Buffer.from(data),
        metadata: meta,
        response: { status: 200 },
      };
    }

    case "create": {
      // Handle Directory Creation
      if (isFolder({ mimeType: resolvedMimeType })) {
        const data = await files.createDirectory(parentId, fileName);
        return {
          data,
          response: { status: 200 },
        };
      }

      // Handle Empty File Creation
      const hasContent = bytes && (bytes.length > 0 || bytes.byteLength > 0);
      if (!hasContent && !fileId) {
        const data = await files.createEmptyFile(parentId, fileName);
        return {
          data,
          response: { status: 200 },
        };
      }

      // Handle Binary File Upload (Create / Update content)
      const data = await files.uploadFile(
        parentId,
        fileName,
        bytes,
        resolvedMimeType,
        fileId
      );

      return {
        data,
        response: { status: 200 },
      };
    }

    default:
      throw new Error(
        `KSuite Stream API method '${method}' is not supported.`
      );
  }
};