/*
 * Copyright (C) 2023 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/routr
 *
 * This file is part of Routr
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as E from "fp-ts/Either"
import { MessageDispatcherConfig } from "../types"
import { schema } from "./schema"
import { ProcessorConfig } from "@routr/common"
import { Helper as H } from "@routr/common"
import Ajv from "ajv"

const ajv = new Ajv()
const validate = ajv.compile(schema)

export const getConfig = (
  path: string
): E.Either<Error, MessageDispatcherConfig> => {
  const c = H.readConfigFile(path) as unknown as {
    spec: MessageDispatcherConfig
  }

  if (!validate({ ...c })) {
    return E.left(new Error(JSON.stringify(validate.errors[0].message)))
  }

  // Convert funcMatch to actual functions
  const processors = c.spec.processors.map((p: ProcessorConfig) => {
    const { ref, addr, methods, matchFunc } = p
    return { ref, addr, methods, matchFunc: eval(`(${matchFunc})`) }
  })

  // Re-insert processors with matchFunc now as a function
  c.spec.processors = processors

  return E.right(c.spec)
}
