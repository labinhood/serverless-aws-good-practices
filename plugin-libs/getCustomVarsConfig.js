"use strict";

function getCustomVarsConfig() {
  return {
    agp: {
      async resolve({ resolveVariable, address }) {
        var resolvedValue = undefined;

        const serviceName = await resolveVariable("self:service");
        const stage = await resolveVariable("sls:stage");
        const region = await resolveVariable("self:provider.region");

        switch (address) {
          case "sls-default-name":
            resolvedValue = serviceName + "-" + stage;
            break;

          case "sls-regional-name":
            resolvedValue = serviceName + "-" + stage + "-" + region;
            break;
        }

        if (!resolvedValue) {
          throw new Error(
            "LabinHood's AWS Good Practices Plugin / Custom variables error," +
              ' could not resolve "agp:' +
              address +
              '", available options: ' +
              "agp:sls-default-name, agp:sls-regional-name"
          );
        }

        return {
          value: resolvedValue,
        };
      },
    },
  };
}

module.exports = getCustomVarsConfig;
