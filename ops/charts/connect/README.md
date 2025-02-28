# Routr Connect

Routr Connect is a lightweight sip proxy, location server, and registrar that provides a reliable and scalable SIP infrastructure for telephony carriers, communication service providers, and integrators.

Website: https://routr.io

## TL;DR;

```bash
$ helm repo add routr https://routr.io/charts
$ helm repo update
$ helm install routr routr/routr
```

**Note**: `routr` is your release name.

## Introduction

This chart bootstraps an [Routr Connect](https://routr.io) deployment on a [Kubernetes](http://kubernetes.io/) cluster using the [Helm](https://helm.sh/) package manager.

## Prerequisites

- Kubernetes v1.25.4+
- Helm v3.11.1
- PV provisioner support in the underlying infrastructure

## Add this Helm repository to your Helm client

```bash
helm repo add routr https://routr.io/charts
```

## Installing the Chart

To install the chart with the release name my-release:

```bash
$ kubectl create namespace routr
$ helm install my-release routr/routr --namespace routr
```

The command deploys Routr Server in the `default` namespace on the Kubernetes cluster in the default configuration.

We recommend using a namespace for easy upgrades.

The [configuration](https://hub.helm.sh/#configuration) section lists the parameters that can be configured during installation.

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

`helm delete my-release`

The command removes all the Kubernetes components but PVC's associated with the chart and deletes the release.

To delete the PVC's associated with my-release:

`kubectl delete pvc -l release=my-release`

> Note: Deleting the PVC's will delete postgresql data as well. Please be cautious before doing it.

## Changelog

The [CHANGELOG](https://github.com/fonoster/routr/tree/gh-pages/charts/CHANGELOG.md) provides notable changes on the chart.

## Parameters

### Global parameters

| Parameter        | Description                                      | Value     |
| ---------------- | ------------------------------------------------ | --------- |
| global.region    | Region for the cluster (reserved for future use) | `default` |
| global.logsLevel | Global logs level recommending only for testing  | `info`    |

### Edgeport parameters

| Parameter                                             | Description                                                                                                   | Value                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `edgeport.externalAddrs`                              | The set of addresses at the edge of the network required to correctly route SIP messages                      | `[]`                                                        |
| `edgeport.methods`                                    | Acceptable SIP methods. Methods not in the list will be treated according with `edgeport.unknownMethodAction` | `["REGISTER", "MESSAGE", "INVITE", "ACK", "BYE", "CANCEL"]` |
| `edgeport.unknownMethodAction`                        | Action upon receiving an unsupported SIP method (Reserved for future use)                                     | `Discard`                                                   |
| `edgeport.transport`                                  | Transport configuration section                                                                               |                                                             |
| `edgeport.transport[*].protocol`                      | Acceptable transport                                                                                          | `TCP`, `UDP`, `TLS`, `WS`, `WSS`                            |
| `edgeport.transport[*].bindAddr`                      | Ipv4 interface to accept requests on                                                                          |                                                             |
| `edgeport.transport[*].port`                          | Port to listen on                                                                                             |                                                             |
| `edgeport.image.repository`                           | Image repository                                                                                              | `fonoster/routr-edgeport`                                   |
| `edgeport.image.tag`                                  | Image tag                                                                                                     | `2.0.8-alpha.35`                                            |
| `edgeport.image.pullPolicy`                           | Image pull policy                                                                                             | `IfNotPresent`                                              |
| `edgeport.podAnnotations`                             | Pod annotations                                                                                               | `{}`                                                        |
| `edgeport.serviceAnnotations`                         | Service annotations                                                                                           | `{}`                                                        |
| `edgeport.resources`                                  | Resource quotas                                                                                               | `{}`                                                        |
| `edgeport.autoscaling.miniReplicas`                   | Minimum number of replicas                                                                                    | `1`                                                         |
| `edgeport.autoscaling.maxReplicas`                    | Maximum number of replicas                                                                                    | `10`                                                        |
| `edgeport.autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage                                                                             | `50`                                                        |
| `edgeport.replicas`                                   | Maximum number of replicas                                                                                    | `2`                                                         |
| `edgeport.securityContext.runAsUser`                  | Running as a non-root user                                                                                    | `1000`                                                      |
| `edgeport.securityContext.runAsGroup`                 | Running as non-root group                                                                                     | `3000`                                                      |
| `edgeport.securityContext.fsGroup`                    | File system group                                                                                             | `2000`                                                      |
| `edgeport.securityContext.allowPrivilegeEscalation`   | By default, no privilege escalation is allowed                                                                | `false`                                                     |
| `edgeport.livenessProbe.initialDelaySeconds`          | Initial delay in seconds before starting the liveness probe                                                   | `10`                                                        |
| `edgeport.livenessProbe.periodSeconds`                | Period between liveness probes                                                                                | `5`                                                         |
| `edgeport.livenessProbe.successThreshold`             | Number of successes required to be considered healthy                                                         | `1`                                                         |
| `edgeport.livenessProbe.failureThreshold`             | Number of failures required to be considered unhealthy                                                        | `2`                                                         |
| `edgeport.livenessProbe.timeoutSeconds`               | Timeout in seconds for liveness probe                                                                         | `1`                                                         |

### Dispatcher parameters

| Parameter                                               | Description                                                 | Value                                                              |
| ------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `dispatcher.processors`                                 | Processors configuration section                            |                                                                    |                    
| `dispatcher.processors[*].ref`                          | Reference to the Processor                                  | `connect-processor`                                                |
| `dispatcher.processors[*].servicePrefix`                | Prefix for the service (Defaults to the release name)       | `{{ .Release.Name }}`                                              |
| `dispatcher.processors[*].serviceName`                  | The name of the service hosting the processor               | `{{ .serviceName }}`                                               |
| `dispatcher.processors[*].serviceNamespace`             | The namespace for the service (Defaults to the release ns)  | `{{ .Release.Namespace }}`                                         |
| `dispatcher.processors[*].matchFunc`                    | Routing function                                            | `req => true`                                                      |
| `dispatcher.processors[*].methods`                      | Acceptable methods                                          | `["REGISTER", "MESSAGE", "INVITE", "ACK", "BYE", "CANCEL"]`        |
| `dispatcher.middlewares`                                | Middlewares configuration section                           | `[]`                                                               |
| `dispatcher.middlewares[*].ref`                         | Reference to the Middleware                                 | `{{ .ref }}`                                                       |
| `dispatcher.middlewares[*].servicePrefix`               | Prefix for the service (Defaults to the release name)       | `{{ .Release.Name }}`                                              |
| `dispatcher.middlewares[*].serviceName`                 | The name of the service hosting the middleware              | `{{ .serviceName }}`                                               |
| `dispatcher.middlewares[*].serviceNamespace`            | The namespace for the service (Defaults to the release ns)  | `{{ .Release.Namespace }}`                                         |
| `dispatcher.middlewares[*].postProcessor`               | If set to true the middleware will run after the processor  | `{{ .postProcessor }}`                                             |
| `dispatcher.image.repository`                           | Image repository                                            | `fonoster/routr-dispatcher`                                        |
| `dispatcher.image.tag`                                  | Image tag                                                   | `2.0.8-alpha.35`                                                   |
| `dispatcher.image.pullPolicy`                           | Image pull policy                                           | `IfNotPresent`                                                     |
| `dispatcher.podAnnotations`                             | Pod annotations                                             | `{}`                                                               |
| `dispatcher.serviceAnnotations`                         | Service annotations                                         | `{}`                                                               |
| `dispatcher.resources`                                  | Resource quotas                                             | `{}`                                                               |
| `dispatcher.autoscaling.minReplicas`                    | Minimum number of replicas                                  | `1`                                                                |
| `dispatcher.autoscaling.maxReplicas`                    | Maximum number of replicas                                  | `10`                                                               |
| `dispatcher.autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage                           | `50`                                                               |
| `dispatcher.securityContext.runAsUser`                  | Running as a non-root user                                  | `1000`                                                             |
| `dispatcher.securityContext.runAsGroup`                 | Running as non-root group                                   | `3000`                                                             |
| `dispatcher.securityContext.fsGroup`                    | File system group                                           | `2000`                                                             |
| `dispatcher.securityContext.allowPrivilegeEscalation`   | By default, no privilege escalation is allowed              | `false`                                                            |
| `dispatcher.livenessProbe.initialDelaySeconds`          | Initial delay in seconds before starting the liveness probe | `5`                                                                |
| `dispatcher.livenessProbe.periodSeconds`                | Period between liveness probes                              | `5`                                                                |
| `dispatcher.livenessProbe.successThreshold`             | Number of successes required to be considered healthy       | `1`                                                                |
| `dispatcher.livenessProbe.failureThreshold`             | Number of failures required to be considered unhealthy      | `2`                                                                |
| `dispatcher.livenessProbe.timeoutSeconds`               | Timeout in seconds for liveness probe                       | `1`                                                                |

### Location parameters

| Parameter                                             | Description                                                 | Value                     |
| ----------------------------------------------------- | ----------------------------------------------------------- | ------------------------- |
| `location.region`                                     | Region for Location service (reserved for future use)       | `default`                 |
| `location.cache.provider`                             | Cache Provider (supports for `redis` and `memory` )         | `redis`                   |
| `location.cache.parameters`                           | Cache Parameters                                            | `""`                      |
| `location.image.repository`                           | Image repository                                            | `fonoster/routr-location` |
| `location.image.tag`                                  | Image tag                                                   | `2.0.8-alpha.35`          |
| `location.image.pullPolicy`                           | Image pull policy                                           | `IfNotPresent`            |
| `location.podAnnotations`                             | Pod annotations                                             | `{}`                      |
| `location.serviceAnnotations`                         | Service annotations                                         | `{}`                      |
| `location.resources`                                  | Resource quotas                                             | `{}`                      |
| `location.autoscaling.minReplicas`                    | Minimum number of replicas                                  | `1`                       |
| `location.autoscaling.maxReplicas`                    | Maximum number of replicas                                  | `10`                      |
| `location.autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage                           | `50`                      |
| `location.securityContext.runAsUser`                  | Running as a non-root user                                  | `1000`                    |
| `location.securityContext.runAsGroup`                 | Running as non-root group                                   | `3000`                    |
| `location.securityContext.fsGroup`                    | File system group                                           | `2000`                    |
| `location.securityContext.allowPrivilegeEscalation`   | By default, no privilege escalation is allowed              | `false`                   |
| `location.livenessProbe.initialDelaySeconds`          | Initial delay in seconds before starting the liveness probe | `5`                       |
| `location.livenessProbe.periodSeconds`                | Period between liveness probes                              | `5`                       |
| `location.livenessProbe.successThreshold`             | Number of successes required to be considered healthy       | `1`                       |
| `location.livenessProbe.failureThreshold`             | Number of failures required to be considered unhealthy      | `2`                       |
| `location.livenessProbe.timeoutSeconds`               | Timeout in seconds for liveness probe                       | `1`                       |

### APIServer parameters

| Parameter                                              | Description                                                 | Value                               |
| ------------------------------------------------------ | ----------------------------------------------------------- | ----------------------------------- |
| `apiserver.image.repository`                           | Image repository                                            | `fonoster/routr-pgdata`            |
| `apiserver.image.tag`                                  | Image tag                                                   | `2.0.8-alpha.35`                   |
| `apiserver.image.pullPolicy`                           | Image pull policy                                           | `IfNotPresent`                     |
| `apiserver.migrationsEnabled`                          | Enables database migrations                                 | `true`                             |
| `apiserver.migrationsImage.repository`                 | Image repository                                            | `fonoster/routr-pgdata-migrations` |
| `apiserver.migrationsImage.tag`                        | Image tag                                                   | `2.0.8-alpha.35`                   |
| `apiserver.migrationsImage.pullPolicy`                 | Image pull policy                                           | `IfNotPresent`                     |
| `apiserver.tlsOn`                                      | Enables TLS for the APIServer                               | `true`                             |
| `apiserver.podAnnotations`                             | Pod annotations                                             | `{}`                               |
| `apiserver.serviceAnnotations`                         | Service annotations                                         | `{}`                               |
| `apiserver.resources`                                  | Resource quotas                                             | `{}`                               |
| `apiserver.autoscaling.miniReplicas`                   | Minimum number of replicas                                  | `1`                                |
| `apiserver.autoscaling.maxReplicas`                    | Maximum number of replicas                                  | `10`                               |
| `apiserver.autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage                           | `50`                               |
| `apiserver.securityContext.runAsUser`                  | Running as a non-root user                                  | `1000`                             |
| `apiserver.securityContext.runAsGroup`                 | Running as non-root group                                   | `3000`                             |
| `apiserver.securityContext.fsGroup`                    | File system group                                           | `2000`                             |
| `apiserver.securityContext.allowPrivilegeEscalation`   | By default, no privilege escalation is allowed              | `false`                            |
| `apiserver.livenessProbe.initialDelaySeconds`          | Initial delay in seconds before starting the liveness probe | `5`                                |
| `apiserver.livenessProbe.periodSeconds`                | Period between liveness probes                              | `5`                                |
| `apiserver.livenessProbe.successThreshold`             | Number of successes required to be considered healthy       | `1`                                |
| `apiserver.livenessProbe.failureThreshold`             | Number of failures required to be considered unhealthy      | `2`                                |
| `apiserver.livenessProbe.timeoutSeconds`               | Timeout in seconds for liveness probe                       | `1`                                |

### Connect Processor parameters

| Parameter                                            | Description                                                 | Value                    |
| ---------------------------------------------------- | ----------------------------------------------------------- | ------------------------ |
| `connect.image.repository`                           | Image repository                                            | `fonoster/routr-connect` |
| `connect.image.tag`                                  | Image tag                                                   | `2.0.8-alpha.35`         |
| `connect.image.pullPolicy`                           | Image pull policy                                           | `IfNotPresent`           |
| `connect.podAnnotations`                             | Pod annotations                                             | `{}`                     |
| `connect.serviceAnnotations`                         | Service annotations                                         | `{}`                     |
| `connect.resources`                                  | Resource quotas                                             | `{}`                     |
| `connect.autoscaling.miniReplicas`                   | Minimum number of replicas                                  | `1`                      |
| `connect.autoscaling.maxReplicas`                    | Maximum number of replicas                                  | `10`                     |
| `connect.autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage                           | `50`                     |
| `connect.securityContext.runAsUser`                  | Running as a non-root user                                  | `1000`                   |
| `connect.securityContext.runAsGroup`                 | Running as non-root group                                   | `3000`                   |
| `connect.securityContext.fsGroup`                    | File system group                                           | `2000`                   |
| `connect.securityContext.allowPrivilegeEscalation`   | By default, no privilege escalation is allowed              | `false`                  |
| `connect.livenessProbe.initialDelaySeconds`          | Initial delay in seconds before starting the liveness probe | `5`                      |
| `connect.livenessProbe.periodSeconds`                | Period between liveness probes                              | `5`                      |
| `connect.livenessProbe.successThreshold`             | Number of successes required to be considered healthy       | `1`                      |
| `connect.livenessProbe.failureThreshold`             | Number of failures required to be considered unhealthy      | `2`                      |
| `connect.livenessProbe.timeoutSeconds`               | Timeout in seconds for liveness probe                       | `1`                      |

### Registry parameters

| Parameter                                             | Description                                                 | Value                     |
| ----------------------------------------------------- | ----------------------------------------------------------- | ------------------------- |
| `registry.registerInterval`                           | Registration interval in seconds                            | `20`                      |
| `registry.methods`                                    | Registration methods for the Allow header                   | `["INVITE", "MESSAGE"]`   |
| `registry.cache.provider`                             | Cache Provider (supports for `redis` and `memory` )         | `redis`                   |
| `registry.cache.parameters`                           | Cache Parameters                                            | `""`                      |
| `registry.image.repository`                           | Image repository                                            | `fonoster/routr-registry` |
| `registry.image.tag`                                  | Image tag                                                   | `2.0.8-alpha.35`          |
| `registry.image.pullPolicy`                           | Image pull policy                                           | `IfNotPresent`            |
| `registry.podAnnotations`                             | Pod annotations                                             | `{}`                      |
| `registry.serviceAnnotations`                         | Service annotations                                         | `{}`                      |
| `registry.resources`                                  | Resource quotas                                             | `{}`                      |
| `registry.autoscaling.minReplicas`                    | Minimum number of replicas                                  | `1`                       |
| `registry.autoscaling.maxReplicas`                    | Maximum number of replicas                                  | `10`                      |
| `registry.autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage                           | `50`                      |
| `registry.securityContext.runAsUser`                  | Running as a non-root user                                  | `1000`                    |
| `registry.securityContext.runAsGroup`                 | Running as non-root group                                   | `3000`                    |
| `registry.securityContext.fsGroup`                    | File system group                                           | `2000`                    |
| `registry.securityContext.allowPrivilegeEscalation`   | By default, no privilege escalation is allowed              | `false`                   |
| `registry.livenessProbe.initialDelaySeconds`          | Initial delay in seconds before starting the liveness probe | `5`                       |
| `registry.livenessProbe.periodSeconds`                | Period between liveness probes                              | `5`                       |
| `registry.livenessProbe.successThreshold`             | Number of successes required to be considered healthy       | `1`                       |
| `registry.livenessProbe.failureThreshold`             | Number of failures required to be considered unhealthy      | `2`                       |
| `registry.livenessProbe.timeoutSeconds`               | Timeout in seconds for liveness probe                       | `1`                       |

### Requester parameters

| Parameter                                              | Description                                                 | Value                      |
| ------------------------------------------------------ | ----------------------------------------------------------- | -------------------------- |
| `requester.image.repository`                           | Image repository                                            | `fonoster/routr-requester` |
| `requester.image.tag`                                  | Image tag                                                   | `2.0.8-alpha.35`           |
| `requester.image.pullPolicy`                           | Image pull policy                                           | `IfNotPresent`             |
| `requester.podAnnotations`                             | Pod annotations                                             | `{}`                       |
| `requester.serviceAnnotations`                         | Service annotations                                         | `{}`                       |
| `requester.resources`                                  | Resource quotas                                             | `{}`                       |
| `requester.autoscaling.miniReplicas`                   | Minimum number of replicas                                  | `1`                        |
| `requester.autoscaling.maxReplicas`                    | Maximum number of replicas                                  | `10`                       |
| `requester.autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage                           | `50`                       |
| `requester.securityContext.runAsUser`                  | Running as a non-root user                                  | `1000`                     |
| `requester.securityContext.runAsGroup`                 | Running as non-root group                                   | `3000`                     |
| `requester.securityContext.fsGroup`                    | File system group                                           | `2000`                     |
| `requester.securityContext.allowPrivilegeEscalation`   | By default, no privilege escalation is allowed              | `false`                    |
| `requester.livenessProbe.initialDelaySeconds`          | Initial delay in seconds before starting the liveness probe | `10`                       |
| `requester.livenessProbe.periodSeconds`                | Period between liveness probes                              | `5`                        |
| `requester.livenessProbe.successThreshold`             | Number of successes required to be considered healthy       | `1`                        |
| `requester.livenessProbe.failureThreshold`             | Number of failures required to be considered unhealthy      | `2`                        |
| `requester.livenessProbe.timeoutSeconds`               | Timeout in seconds for liveness probe                       | `1`                        |

### RTPRelay parameters

| Parameter                                             | Description                                                 | Value                     |
| ----------------------------------------------------- | ----------------------------------------------------------- | ------------------------- |
| `rtprelay.enabled`                                    | Enables the rtprelay Pod                                    | `false`                   |
| `rtprelay.rtpeHost`                                   | RTPEngine host                                              | `""`                      |
| `rtprelay.rtpePort`                                   | RTPEngine admin port                                        | `22222`                   |
| `rtprelay.image.repository`                           | Image repository                                            | `fonoster/routr-rtprelay` |
| `rtprelay.image.tag`                                  | Image tag                                                   | `2.0.8-alpha.35`          |
| `rtprelay.image.pullPolicy`                           | Image pull policy                                           | `IfNotPresent`            |
| `rtprelay.podAnnotations`                             | Pod annotations                                             | `{}`                      |
| `rtprelay.serviceAnnotations`                         | Service annotations                                         | `{}`                      |
| `rtprelay.resources`                                  | Resource quotas                                             | `{}`                      |
| `rtprelay.autoscaling.miniReplicas`                   | Minimum number of replicas                                  | `1`                       |
| `rtprelay.autoscaling.maxReplicas`                    | Maximum number of replicas                                  | `10`                      |
| `rtprelay.autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage                           | `50`                      |
| `rtprelay.securityContext.runAsUser`                  | Running as a non-root user                                  | `1000`                    |
| `rtprelay.securityContext.runAsGroup`                 | Running as non-root group                                   | `3000`                    |
| `rtprelay.securityContext.fsGroup`                    | File system group                                           | `2000`                    |
| `rtprelay.securityContext.allowPrivilegeEscalation`   | By default, no privilege escalation is allowed              | `false`                   |
| `rtprelay.livenessProbe.initialDelaySeconds`          | Initial delay in seconds before starting the liveness probe | `10`                      |
| `rtprelay.livenessProbe.periodSeconds`                | Period between liveness probes                              | `5`                       |
| `rtprelay.livenessProbe.successThreshold`             | Number of successes required to be considered healthy       | `1`                       |
| `rtprelay.livenessProbe.failureThreshold`             | Number of failures required to be considered unhealthy      | `2`                       |
| `rtprelay.livenessProbe.timeoutSeconds`               | Timeout in seconds for liveness probe                       | `1`                       |

### Postgres Values

This is taken from Bitnami Helm Chart. Please refer to https://bitnami.com/stack/postgresql/helm

Here are the default values:

```
# Postgresql Service defaults
postgresql:
  # Whether to enable PostgreSQL
  enabled: true
  auth:
    # Initial username for the database
    username: routr
    # Initial password for the database
    password: changeme
```

### Redis Values

This is taken from Bitnami Helm Chart. Please refer to https://bitnami.com/stack/postgres/helm

Here are the default values:

```
# Redis Service defaults
redis:
  # Whether to enable Redis
  enabled: true
  architecture: standalone
  auth:
    enabled: false
```

## Specifying Values

Specify each parameter using the --set key=value[, key=value] argument to helm install. For example,

```bash
$ helm install --wait my-release \
  --set global.logLevel=debug \
  routr/routr
```

Alternatively, you can provide a YAML file that specifies the above parameters' values while installing the chart. For example:

```bash
$ helm install --wait my-release -f values.yaml routr/routr
```
