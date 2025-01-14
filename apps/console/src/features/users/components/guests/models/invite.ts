/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { InviteUserStatus } from "apps/console/src/extensions/components/users/models";

/**
  * Enum for role types.
  */
export enum RoleType {
    EVERYONE = "everyone",
    SYSTEM = "system",
    SELFSIGNUP = "selfsignup"
}

/**
  * Interface to store data for create group api.
  */
export interface UserInviteInterface {
    id?: string;
    roles?: string[];
    email?: string;
    status?: InviteUserStatus;
    expiredAt?: string;
    username?: string;
}

/**
 * Interface to store invitations list.
 */
export interface InvitationsInterface {
    invitations?: UserInviteInterface[];
}

/**
 * Interface to store data for create group api.
 */
export interface UserInviteInterface {
    id?: string;
    roles?: string[];
    email?: string;
    status?: InviteUserStatus;
    username?: string;
}
