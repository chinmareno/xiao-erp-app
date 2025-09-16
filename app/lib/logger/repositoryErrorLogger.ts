type RepositoryErrorLoggerType = {
  method: string;
  error: any;
  logType?: "warn" | "error";
};

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
