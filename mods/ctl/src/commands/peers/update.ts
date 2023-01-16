/*
 * Copyright (C) 2023 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster
 *
 * This file is part of Routr.
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
/* eslint-disable require-jsdoc */
import { CliUx } from "@oclif/core"
import { BaseCommand } from "../../base"
import { CLIError } from "@oclif/core/lib/errors"
import { CommonConnect as CC, CommonTypes as CT } from "@routr/common"
import SDK from "@routr/sdk"

// NOTE: Newer versions of inquirer have a bug that causes the following error:
// (node:75345) [ERR_REQUIRE_ESM] Error Plugin: @routr/ctl [ERR_REQUIRE_ESM]: require() of ES Module
import inquirer from "inquirer"

export default class UpdatePeerCommand extends BaseCommand {
  static description = "Updates an existing Peer"

  static examples = [
    `<%= config.bin %> <%= command.id %>
Updating Peer Asterisk Conf... 80181ca6-d4aa-4575-9375-8f72b07d5555
`
  ]

  static args = [
    { name: "ref", required: true, description: "Credentials reference" }
  ]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(UpdatePeerCommand)
    const { endpoint, insecure } = flags
    const api = new SDK.Peers({ endpoint, insecure })

    this.log("This utility will help you update an existing Peer.")
    this.log("Press ^C at any time to quit.")

    const peerFromDB = await api.getPeer(args.ref)

    // TODO: Fix hardcoded pageSize
    const acls = await new SDK.ACL({ endpoint, insecure }).listACLs({
      pageSize: 25,
      pageToken: ""
    })

    // TODO: Fix hardcoded pageSize
    const credentials = await new SDK.Credentials({
      endpoint,
      insecure
    }).listCredentials({
      pageSize: 25,
      pageToken: ""
    })

    if (acls.items.length === 0 || credentials.items.length === 0) {
      throw new Error("you must create at least one ACL and Credentials")
    }

    const aclList =
      acls.items?.map((acl: CC.AccessControlList) => {
        return { name: acl.name, value: acl.ref }
      }) || []

    const credentialsList =
      credentials.items?.map((credential: CC.Credentials) => {
        return { name: credential.name, value: credential.ref }
      }) || []

    const answers = await inquirer.prompt([
      {
        name: "name",
        message: "Name",
        type: "input",
        default: peerFromDB.name
      },
      {
        name: "username",
        message: "Username",
        type: "input",
        default: peerFromDB.username
      },
      {
        name: "aor",
        message: "Adress of Record (e.g. sip:5001@sip.local)",
        type: "input",
        default: peerFromDB.aor
      },
      {
        name: "contactAddr",
        message: "Optional Contact Addresss",
        type: "input",
        default: peerFromDB.contactAddr || undefined
      },
      {
        name: "accessControlListRef",
        message: "Access Control List",
        choices: aclList,
        type: "list",
        default: peerFromDB.accessControlListRef
      },
      {
        name: "credentialsRef",
        message: "Credentials",
        choices: credentialsList,
        type: "list",
        default: peerFromDB.credentialsRef
      },
      {
        name: "withSessionAffinity",
        message: "With Session Affinity?",
        type: "confirm",
        default: peerFromDB.withSessionAffinity,
        when: (answers) => answers.aor.includes("backend:")
      },
      {
        name: "balancingAlgorithm",
        message: "Balancing Algorithm",
        choices: [
          { name: "Round Robin", value: CT.LoadBalancingAlgorithm.ROUND_ROBIN },
          {
            name: "Least Sessions",
            value: CT.LoadBalancingAlgorithm.LEAST_SESSIONS
          }
        ],
        type: "list",
        default: peerFromDB.balancingAlgorithm,
        when: (answers) => answers.aor.includes("backend:")
      },
      {
        name: "confirm",
        message: "Ready?",
        type: "confirm"
      }
    ])
    answers.ref = args.ref

    if (!answers.confirm) {
      this.warn("Aborted")
    } else {
      try {
        CliUx.ux.action.start(`Updating Peer ${answers.name}`)
        const acl = await api.updatePeer(answers)
        await CliUx.ux.wait(1000)
        CliUx.ux.action.stop(acl.ref)
      } catch (e) {
        CliUx.ux.action.stop()
        throw new CLIError(e.message)
      }
    }
  }
}
