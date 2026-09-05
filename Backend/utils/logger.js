const logger = {
  info: (...args) => {
    console.log(
      "Date & Time: ",
      new Date().toISOString(),
      "\n",
      "[INFO] :",
      ...args,
    );
  },

  warn: (...args) => {
    console.warn(
      "Date & Time: ",
      new Date().toISOString(),
      "\n",
      "[WARN] :",
      ...args,
    );
  },

  error: (...args) => {
    console.error(
      "Date & Time: ",
      new Date().toISOString(),
      "\n",
      "[ERROR] :",
      ...args,
    );
  },
};

export default logger;
