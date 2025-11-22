type ServiceErrorLoggerType = {
  method: string;
  error: string;
  logType?: "warn" | "error";
};

export const serviceErrorLogger = ({
  method,
  error,
  logType = "error",
}: ServiceErrorLoggerType) => {
  if (logType === "error") {
    console.error(`Service Error ${method}: ${error}`);
  }
  if (logType === "warn") {
    console.warn(`Service Error ${method}: ${error}`);
  }
};
