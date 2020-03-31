/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import { Message, MessageProps } from "semantic-ui-react";
import React, { FunctionComponent, ReactElement } from "react";
import classNames from "classnames";

/**
 * Proptypes for the resource list item component.
 */
export interface ResourceListItemPropsInterface extends MessageProps {
    /**
     * If the message should be attached to the top.
     */
    attached?: boolean;
}

/**
 * Confirmation modal actions component.
 *
 * @param {ResourceListItemPropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const ConfirmationModalMessage: FunctionComponent<ResourceListItemPropsInterface> = (
    props: MessageProps
): ReactElement => {

    const {
        attached,
        children,
        className,
        ...rest
    } = props;

    const classes = classNames(
        "confirmation-modal-message",
        {
            attached
        },
        className
    );

    return (
        <Message { ...rest } className={ classes }>{ children }</Message>
    );
};
