type RepositoryErrorLoggerType = {
  method: string;
  error: unknown;
  logType?: "warn" | "error";
};

// TODO: use a proper logging library
export const repositoryErrorLogger = ({
  method,
  error,
  logType = "error",
}: RepositoryErrorLoggerType) => {
  if (logType === "error") {
    console.error(`Repository Error ${method}: ${error}`);
  }
  if (logType === "warn") {
    console.warn(`Repository Error ${method}: ${error}`);
  }
};
