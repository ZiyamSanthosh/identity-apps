/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com).
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

import { RolesInterface } from "@wso2is/core/models";
import { Forms } from "@wso2is/forms";
import { TransferComponent, TransferList, TransferListItem } from "@wso2is/react-components";
import escapeRegExp from "lodash-es/escapeRegExp";
import isEmpty from "lodash-es/isEmpty";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Proptypes for assign role component.
 */
interface AssignRoleProps {
    initialValues: any;
    triggerSubmit: boolean;
    onSubmit: (values: any) => void;
    handleRoleListChange: (roles: any) => void;
    handleTempListChange: (roles: any) => void;
    handleInitialTempListChange: (groups: any) => void;
    handleInitialRoleListChange: (groups: any) => void;
    handleSetRoleId: (groupId: string) => void;
}

/**
 * Assign Role component.
 *
 * @returns Assign Roles component.
 */
export const AssignRoles: FunctionComponent<AssignRoleProps> = (props: AssignRoleProps): ReactElement => {

    const {
        initialValues,
        triggerSubmit,
        onSubmit,
        handleRoleListChange,
        handleTempListChange,
        handleInitialTempListChange,
        handleInitialRoleListChange,
        handleSetRoleId
    } = props;

    const { t } = useTranslation();

    const [ checkedUnassignedListItems, setCheckedUnassignedListItems ] = useState<RolesInterface[]>([]);
    const [ checkedAssignedListItems, setCheckedAssignedListItems ] = useState<RolesInterface[]>([]);
    const [ isSelectUnassignedRolesAllRolesChecked, setIsSelectUnassignedAllRolesChecked ] = useState(false);
    const [ isSelectAssignedAllRolesChecked, setIsSelectAssignedAllRolesChecked ] = useState(false);

    useEffect(() => {
        if (isSelectAssignedAllRolesChecked) {
            setCheckedAssignedListItems(initialValues?.tempRoleList);
        } else {
            setCheckedAssignedListItems([]);
        }
    }, [ isSelectAssignedAllRolesChecked ]);

    useEffect(() => {
        if (isSelectUnassignedRolesAllRolesChecked) {
            setCheckedUnassignedListItems(initialValues?.roleList);
        } else {
            setCheckedUnassignedListItems([]);
        }
    }, [ isSelectUnassignedRolesAllRolesChecked ]);

    /**
     * The following function enables the user to select all the roles at once.
     */
    const selectAllUnAssignedList = () => {
        setIsSelectUnassignedAllRolesChecked(!isSelectUnassignedRolesAllRolesChecked);
    };

    /**
     * The following function enables the user to deselect all the roles at once.
     */
    const selectAllAssignedList = () => {
        setIsSelectAssignedAllRolesChecked(!isSelectAssignedAllRolesChecked);
    };

    const handleUnselectedListSearch = (
        e: React.FormEvent<HTMLInputElement>,
        { value }: { value: string;}
    ) => {
        let isMatch: boolean = false;
        const filteredRoleList: RolesInterface[] = [];

        if (!isEmpty(value)) {
            const re: RegExp = new RegExp(escapeRegExp(value), "i");

            initialValues.roleList && initialValues.roleList.map((role: RolesInterface) => {
                isMatch = re.test(role.displayName);
                if (isMatch) {
                    filteredRoleList.push(role);
                    handleRoleListChange(filteredRoleList);
                }
            });
        } else {
            handleRoleListChange(initialValues?.initialRoleList);
        }
    };

    const handleSelectedListSearch = (
        e: React.FormEvent<HTMLInputElement>,
        { value }: { value: string;}
    ) => {
        let isMatch: boolean = false;
        const filteredRoleList: RolesInterface[] = [];

        if (!isEmpty(value)) {
            const re: RegExp = new RegExp(escapeRegExp(value), "i");

            initialValues.tempRoleList && initialValues.tempRoleList.map((role: RolesInterface) => {
                isMatch = re.test(role.displayName);
                if (isMatch) {
                    filteredRoleList.push(role);
                    handleTempListChange(filteredRoleList);
                }
            });
        } else {
            handleTempListChange(initialValues?.initialTempRoleList);
        }
    };

    const addRoles = () => {
        const addedRoles: RolesInterface[] = [ ...initialValues.tempRoleList ];

        if (checkedUnassignedListItems?.length > 0) {
            checkedUnassignedListItems.map((role: RolesInterface) => {
                if (!(initialValues?.tempRoleList?.includes(role))) {
                    addedRoles.push(role);
                }
            });
        }
        handleTempListChange(addedRoles);
        handleInitialTempListChange(addedRoles);
        handleRoleListChange(initialValues?.roleList.filter((x: RolesInterface) => !addedRoles?.includes(x)));
        handleInitialRoleListChange(initialValues?.roleList.filter((x: RolesInterface) => !addedRoles?.includes(x)));
        setIsSelectUnassignedAllRolesChecked(false);
    };

    const removeRoles = () => {
        const removedRoles: RolesInterface[] = [ ...initialValues?.roleList ];

        if (checkedAssignedListItems?.length > 0) {
            checkedAssignedListItems.map((role: RolesInterface) => {
                if (!(initialValues?.roleList?.includes(role))) {
                    removedRoles.push(role);
                }
            });
        }
        handleRoleListChange(removedRoles);
        handleInitialRoleListChange(removedRoles);
        handleTempListChange(initialValues?.tempRoleList?.filter((x: RolesInterface) => !removedRoles?.includes(x)));
        handleInitialTempListChange(initialValues?.tempRoleList?.filter((
            x: RolesInterface) => !removedRoles?.includes(x)));
        setCheckedUnassignedListItems([]);
        setIsSelectAssignedAllRolesChecked(false);
    };

    const handleUnassignedItemCheckboxChange = (role: RolesInterface) => {
        const checkedRoles: RolesInterface[] = [ ...checkedUnassignedListItems ];

        if (checkedRoles.includes(role)) {
            checkedRoles.splice(checkedRoles.indexOf(role), 1);
            setCheckedUnassignedListItems(checkedRoles);
        } else {
            checkedRoles.push(role);
            setCheckedUnassignedListItems(checkedRoles);
        }
    };

    const handleAssignedItemCheckboxChange = (role: RolesInterface) => {
        const checkedRoles: RolesInterface[] = [ ...checkedAssignedListItems ];

        if (checkedRoles.includes(role)) {
            checkedRoles.splice(checkedRoles.indexOf(role), 1);
            setCheckedAssignedListItems(checkedRoles);
        } else {
            checkedRoles.push(role);
            setCheckedAssignedListItems(checkedRoles);
        }
    };

    /**
     * The following method handles creating a label for the list item.
     *
     * @param roleType - string
     */
    const createItemLabel = (roleType: string, application: string) => {
        const role: string[] = roleType.split("/");
        
        if (role.length > 0) {
            if (role[0] == "application") {
                return {
                    labelColor: null,
                    labelText: t("console:manage.features.roles.addRoleWizard." + 
                        "forms.roleBasicDetails.roleAudience.values.application"),
                    name: "audience-label",
                    subLabel: application
                };
            } else {
                return { 
                    labelColor: null, 
                    labelText: t("console:manage.features.roles.addRoleWizard." + 
                        "forms.roleBasicDetails.roleAudience.values.organization"), 
                    name: "audience-label" 
                };
            }
        }
    };

    return (
        <>
            <Forms
                onSubmit={ () => {
                    onSubmit({ roles: initialValues?.tempRoleList });
                } }
                submitState={ triggerSubmit }
            >
                <TransferComponent
                    searchPlaceholder={ t("console:manage.features.transferList.searchPlaceholder",
                        { type: "Roles" }) }
                    addItems={ addRoles }
                    removeItems={ removeRoles }
                    handleUnelectedListSearch={ handleUnselectedListSearch }
                    handleSelectedListSearch={ handleSelectedListSearch }
                    data-testid="user-mgt-add-user-wizard-modal"
                >
                    <TransferList
                        isListEmpty={ !(initialValues?.roleList?.length > 0) }
                        listType="unselected"
                        listHeaders={ [
                            t("console:manage.features.transferList.list.headers.1"),
                            t("console:manage.features.transferList.list.headers.2"),""
                        ] }
                        handleHeaderCheckboxChange={ selectAllUnAssignedList }
                        isHeaderCheckboxChecked={ isSelectUnassignedRolesAllRolesChecked }
                        emptyPlaceholderContent={ t("console:manage.features.transferList.list.emptyPlaceholders." +
                            "groups.unselected", { type: "roles" }) }
                        data-testid="user-mgt-add-user-wizard-modal-unselected-roles-select-all-checkbox"
                        emptyPlaceholderDefaultContent={ t("console:manage.features.transferList.list."
                            + "emptyPlaceholders.default") }
                    >
                        {
                            initialValues?.roleList?.map((role: RolesInterface, index: number)=> {
                                const roleName: string[] = role?.displayName?.split("/");

                                return (
                                    <TransferListItem
                                        handleItemChange={ () => handleUnassignedItemCheckboxChange(role) }
                                        key={ index }
                                        listItem={ roleName?.length > 1 ? roleName[1] : role?.displayName }
                                        listItemId={ role.id }
                                        listItemIndex={ index }
                                        listItemTypeLabel={ 
                                            createItemLabel(role?.audience.type, role?.audience.display) 
                                        }
                                        isItemChecked={ checkedUnassignedListItems.includes(role) }
                                        showSecondaryActions={ false }
                                        handleOpenPermissionModal={ () => handleSetRoleId(role.id) }
                                        reOrderLabel
                                        showSubLabel
                                        data-testid="user-mgt-add-user-wizard-modal-unselected-roles"
                                    />
                                );
                            })
                        }
                    </TransferList>
                    <TransferList
                        isListEmpty={ !(initialValues?.tempRoleList?.length > 0) }
                        listType="selected"
                        listHeaders={ [
                            t("console:manage.features.transferList.list.headers.1"),
                            t("console:manage.features.transferList.list.headers.2")
                        ] }
                        handleHeaderCheckboxChange={ selectAllAssignedList }
                        isHeaderCheckboxChecked={ isSelectAssignedAllRolesChecked }
                        emptyPlaceholderContent={ t("console:manage.features.transferList.list.emptyPlaceholders." +
                            "groups.selected", { type: "roles" }) }
                        data-testid="user-mgt-add-user-wizard-modal-selected-roles-select-all-checkbox"
                        emptyPlaceholderDefaultContent={ t("console:manage.features.transferList.list."
                            + "emptyPlaceholders.default") }
                    >
                        {
                            initialValues?.tempRoleList?.map((role: RolesInterface, index: number)=> {
                                const roleName: string[] = role.displayName.split("/");

                                return (
                                    <TransferListItem
                                        handleItemChange={ () => handleAssignedItemCheckboxChange(role) }
                                        key={ index }
                                        listItem={ roleName?.length > 1 ? roleName[1] : role?.displayName }
                                        listItemId={ role.id }
                                        listItemIndex={ index }
                                        listItemTypeLabel={ 
                                            createItemLabel(role?.audience.type, role?.audience.display) 
                                        }
                                        isItemChecked={ checkedAssignedListItems.includes(role) }
                                        showSecondaryActions={ false }
                                        reOrderLabel
                                        showSubLabel
                                        data-testid="user-mgt-add-user-wizard-modal-selected-roles"
                                    />
                                );
                            })
                        }
                    </TransferList>
                </TransferComponent>
            </Forms>
        </>
    );
};
