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

import { UIConstants } from "@wso2is/core/constants";
import { AlertLevels, TestableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { StringUtils } from "@wso2is/core/utils";
import {
    CodeEditor,
    ConfirmationModal,
    Heading,
    SegmentedAccordion,
    Text
} from "@wso2is/react-components";
import beautify from "js-beautify";
import React, { FunctionComponent, ReactElement, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Checkbox, Icon, Menu, Sidebar } from "semantic-ui-react";
import { stripSlashes } from "slashes";
import { ScriptTemplatesSidePanel } from "./script-templates-side-panel";
import { getAdaptiveAuthTemplates } from "../../../../api";
import { ApplicationManagementConstants } from "../../../../constants";
import {
    AdaptiveAuthTemplateInterface,
    AdaptiveAuthTemplatesListInterface,
    AuthenticationSequenceInterface
} from "../../../../models";
import { AdaptiveScriptUtils } from "../../../../utils";

/**
 * Proptypes for the adaptive scripts component.
 */
interface AdaptiveScriptsPropsInterface extends TestableComponentInterface {
    /**
     * Currently configured authentication sequence for the application.
     */
    authenticationSequence: AuthenticationSequenceInterface;
    /**
     * The number of authentication steps.
     */
    authenticationSteps: number;
    /**
     * Specifies if the script is default or not.
     */
    isDefaultScript: boolean;
    /**
     * Is the application info request loading.
     */
    isLoading?: boolean;
    /**
     * Toggle the accordion.
     */
    isMinimized?: boolean;
    /**
     * Delegates the event to the parent component. Once
     * called the resetting event will be notified to it
     * as well.
     */
    onAdaptiveScriptReset: () => void;
    /**
     * Callback when the script changes.
     * @param {string | string[]} script - Authentication script.
     */
    onScriptChange: (script: string | string[]) => void;
    /**
     * Fired when a template is selected.
     * @param {AdaptiveAuthTemplateInterface} template - Adaptive authentication template.
     */
    onTemplateSelect: (template: AdaptiveAuthTemplateInterface) => void;
    /**
     * Make the form read only.
     */
    readOnly?: boolean;
}

/**
 * Configure the authentication flow using an adaptive script.
 *
 * @param {AdaptiveScriptsPropsInterface} props - Props injected to the component.
 * @return {ReactElement}
 */
export const ScriptBasedFlow: FunctionComponent<AdaptiveScriptsPropsInterface> = (
    props: AdaptiveScriptsPropsInterface
): ReactElement => {

    const {
        authenticationSequence,
        onTemplateSelect,
        onScriptChange,
        readOnly,
        authenticationSteps,
        isDefaultScript,
        isMinimized,
        onAdaptiveScriptReset,
        ["data-testid"]: testId
    } = props;

    const { t } = useTranslation();

    const dispatch = useDispatch();

    const authTemplatesSidePanelRef = useRef(null);
    const scriptEditorSectionRef = useRef(null);

    const [ scriptTemplates, setScriptTemplates ] = useState<AdaptiveAuthTemplatesListInterface>(undefined);
    const [ showAuthTemplatesSidePanel, setAuthTemplatesSidePanelVisibility ] = useState<boolean>(true);
    const [ sourceCode, setSourceCode ] = useState<string | string[]>(undefined);
    const [ isEditorDarkMode, setIsEditorDarkMode ] = useState<boolean>(true);
    const [ internalScript, setInternalScript ] = useState<string | string[]>(undefined);
    const [ internalStepCount, setInternalStepCount ] = useState<number>(undefined);
    const [ isScriptFromTemplate, setIsScriptFromTemplate ] = useState<boolean>(false);
    const [ isNewlyAddedScriptTemplate, setIsNewlyAddedScriptTemplate ] = useState<boolean>(false);
    const [ showScriptResetWarning, setShowScriptResetWarning ] = useState<boolean>(false);
    const [ showConditionalAuthContent, setShowConditionalAuthContent ] = useState<boolean>(isMinimized);

    useEffect(() => {
        getAdaptiveAuthTemplates()
            .then((response) => {
                setScriptTemplates(response);
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.description) {
                    dispatch(addAlert({
                        description: error.response.data.description,
                        level: AlertLevels.ERROR,
                        message: UIConstants.API_RETRIEVAL_ERROR_ALERT_MESSAGE
                    }));

                    return;
                }

                dispatch(addAlert({
                    description: ApplicationManagementConstants.ADAPTIVE_AUTH_TEMPLATES_FETCH_ERROR,
                    level: AlertLevels.ERROR,
                    message: UIConstants.API_RETRIEVAL_ERROR_ALERT_MESSAGE
                }));
            });
    }, []);

    const setScriptEditorWidth = () => {
        let width = "100%";

        if (showAuthTemplatesSidePanel) {
            width = `calc(100% - ${ authTemplatesSidePanelRef?.current?.ref?.current?.offsetWidth }px)`;
        }

        scriptEditorSectionRef.current.style.width = width;
    };

    /**
     * Triggered on `showAuthenticatorsSidePanel` change.
     */
    useEffect(() => {
        setScriptEditorWidth();
    }, [ showAuthTemplatesSidePanel ]);

    /**
     * Triggered after component mounted change.
     */
    useEffect(() => {
        setScriptEditorWidth();
    });

    /**
     * Checks for a script in auth sequence to handle content visibility.
     */
    useEffect(() => {
        
        if (authenticationSequence?.script) {
            setShowConditionalAuthContent(true);
            return;
        }
        
        setShowConditionalAuthContent(false);
    }, [ authenticationSequence ]);

    /**
     * Triggered on steps and script change.
     */
    useEffect(() => {
        resolveAdaptiveScript(authenticationSequence?.script);
    }, [ authenticationSequence?.steps, authenticationSequence?.script, authenticationSteps ]);

    /**
     * Resolves the adaptive script.
     *
     * @param {string} script - Script passed through props.
     * @return {string | string[]} Moderated script.
     */
    const resolveAdaptiveScript = (script: string): string | string[] => {
        // Check if there is no script defined and the step count is o.
        // If so, return the default script.
        if (!script && authenticationSequence?.steps?.length === 0) {
            setSourceCode(AdaptiveScriptUtils.getDefaultScript());
            setIsScriptFromTemplate(false);
            return;
        }

        if (!script && authenticationSequence?.steps?.length > 0) {
            setSourceCode(AdaptiveScriptUtils.generateScript(authenticationSteps + 1));
            setIsScriptFromTemplate(false);
            return;
        }

        // Scripts from templates comes in the form of `"["script"]"`. `isValidJSONString` checks for that.
        if (StringUtils.isValidJSONString(script)) {

            // Checks if the script in the editor is from a template and if the editor content and the sent script
            // is different. If so, some edits have been made and we shouldn't touch the editor content.
            if (isScriptFromTemplate
                && !isNewlyAddedScriptTemplate
                && (AdaptiveScriptUtils.minifyScript(internalScript)
                    !== AdaptiveScriptUtils.minifyScript(JSON.parse(script)))) {

                return;
            }

            setIsScriptFromTemplate(true);
            setSourceCode(JSON.parse(script));
            setIsNewlyAddedScriptTemplate(false);
            return;
        }

        // If a script is defined, checks whether if it is a default. If so, generates the basic default script
        // based on the number of steps.
        if (script
            && AdaptiveScriptUtils.isDefaultScript(internalScript ?? script,
                internalStepCount ?? authenticationSteps)) {

            setInternalStepCount(authenticationSteps);
            setSourceCode(AdaptiveScriptUtils.generateScript(authenticationSteps + 1));
            setIsScriptFromTemplate(false);
            return;
        }

        // If a script is defined, checks whether if it is not a default.
        if (script
            && !AdaptiveScriptUtils.isDefaultScript(internalScript ?? script,
                internalStepCount ?? authenticationSteps)) {

            setInternalStepCount(authenticationSteps);

            // Checks if the editor content is different to the externally provided script.
            if (AdaptiveScriptUtils.minifyScript(internalScript) !== AdaptiveScriptUtils.minifyScript(script)) {
                setSourceCode(internalScript ?? script);
                return;
            }

            setSourceCode(beautify.js(stripSlashes(script)));
            setIsScriptFromTemplate(false);
            return;
        }

        if (isDefaultScript) {
            resetAdaptiveScriptTemplateToDefaultHandler();
            return;
        }

        setSourceCode(script);
        setIsScriptFromTemplate(false);
    };

    const resetAdaptiveScriptTemplateToDefaultHandler = () => {
        setSourceCode(AdaptiveScriptUtils.generateScript(authenticationSteps + 1));
        setIsScriptFromTemplate(false);
        onAdaptiveScriptReset();
        setShowConditionalAuthContent(false);
    };

    /**
     * Handles the template sidebar toggle.
     */
    const handleScriptTemplateSidebarToggle = () => {
        setAuthTemplatesSidePanelVisibility(!showAuthTemplatesSidePanel);
    };

    /**
     * Handles template selection click event.
     *
     * @param {AdaptiveAuthTemplateInterface} template - Adaptive authentication template.
     */
    const handleTemplateSelection = (template: AdaptiveAuthTemplateInterface) => {
        setIsNewlyAddedScriptTemplate(true);
        onTemplateSelect(template);
    };

    /**
     * Toggles editor dark mode.
     */
    const handleEditorDarkModeToggle = () => {
        setIsEditorDarkMode(!isEditorDarkMode);
    };

    /**
     * Handles conditional authentication on/off swicth.
     */
    const handleConditionalAuthToggleChange = (): void => {
        
        if (showConditionalAuthContent) {
            setShowScriptResetWarning(true);
            return;
        }

        setShowConditionalAuthContent(true);
    };

    return (
        <>
            <div className="conditional-auth-section">
                <SegmentedAccordion
                    fluid
                    data-testid={ `${ testId }-accordion` }
                    className="conditional-auth-accordion"
                >
                    <SegmentedAccordion.Title
                        data-testid={ `${ testId }-accordion-title` }
                        active={ showConditionalAuthContent }
                        content={ (
                            <>
                                <div
                                    className="conditional-auth-accordion-title"
                                >
                                    <Checkbox
                                        toggle
                                        onChange={ handleConditionalAuthToggleChange }
                                        checked={ showConditionalAuthContent }
                                        className="conditional-auth-accordion-toggle"
                                    />
                                    <div className="conditional-auth-accordion-title-text">
                                        <Heading as="h5" compact>Conditional Authentication</Heading>
                                        <Text muted compact>Control your Authentication flow using a script.</Text>
                                    </div>
                                </div>
                            </>
                        ) }
                        hideChevron={ true }
                    />
                    <SegmentedAccordion.Content
                        active={ showConditionalAuthContent }
                        className="conditional-auth-accordion-content"
                        data-testid={ `${ testId }-accordion-content` }
                    >
                        <Sidebar.Pushable className="script-editor-with-template-panel no-border">
                            { !readOnly && (
                                <ScriptTemplatesSidePanel
                                    title={
                                        t("console:develop.features.applications.edit.sections" +
                                            ".signOnMethod.sections" +
                                            ".authenticationFlow.sections.scriptBased.editor.templates.heading")
                                    }
                                    ref={ authTemplatesSidePanelRef }
                                    onTemplateSelect={ handleTemplateSelection }
                                    templates={
                                        scriptTemplates?.templatesJSON &&
                                        Object.values(scriptTemplates.templatesJSON)
                                    }
                                    visible={ showAuthTemplatesSidePanel }
                                    readOnly={ readOnly }
                                    data-testid={ `${ testId }-script-templates-side-panel` }
                                />
                            ) }
                            <Sidebar.Pusher>
                                <div className="script-editor-container" ref={ scriptEditorSectionRef }>
                                    <Menu attached="top" className="action-panel" secondary>
                                            <Menu.Menu position="right">
                                                <Menu.Item>
                                                    <Checkbox
                                                        label={
                                                            t("console:develop.features.applications.edit.sections" +
                                                                ".signOnMethod.sections.authenticationFlow.sections" +
                                                                ".scriptBased.editor.templates.darkMode")
                                                        }
                                                        checked={ isEditorDarkMode }
                                                        onChange={ handleEditorDarkModeToggle }
                                                        data-testid={ `${ testId }-code-editor-mode-toggle` }
                                                        slider
                                                    />
                                                </Menu.Item>
                                                { !readOnly && (
                                                    <Menu.Item
                                                        onClick={ handleScriptTemplateSidebarToggle }
                                                        className="action"
                                                        data-testid={ `${ testId }-script-template-sidebar-toggle` }
                                                    >
                                                        <Icon name="bars"/>
                                                    </Menu.Item>
                                                ) }
                                            </Menu.Menu>
                                    </Menu>

                                    <div className="code-editor-wrapper">
                                        <CodeEditor
                                            lint
                                            language="javascript"
                                            sourceCode={ sourceCode }
                                            options={ {
                                                lineWrapping: true
                                            } }
                                            onChange={ (editor, data, value) => {
                                                setInternalScript(value);
                                                onScriptChange(value);
                                            } }
                                            theme={ isEditorDarkMode ? "dark" : "light" }
                                            readOnly={ readOnly }
                                            data-testid={ `${ testId }-code-editor` }
                                        />
                                    </div>
                                </div>
                            </Sidebar.Pusher>
                        </Sidebar.Pushable>
                    </SegmentedAccordion.Content>
                </SegmentedAccordion>
            </div>
            <ConfirmationModal
                onClose={ (): void => setShowScriptResetWarning(false) }
                type="warning"
                open={ showScriptResetWarning }
                primaryAction={ t("common:confirm") }
                secondaryAction={ t("common:cancel") }
                onSecondaryActionClick={ (): void => setShowScriptResetWarning(false) }
                onPrimaryActionClick={ (): void => {
                    setShowScriptResetWarning(false);
                    resetAdaptiveScriptTemplateToDefaultHandler();
                } }
                data-testid={ `${ testId }-delete-confirmation-modal` }
                closeOnDimmerClick={ false }
            >
                <ConfirmationModal.Header data-testid={ `${ testId }-reset-confirmation-modal-header` }>
                    { t("console:develop.features.applications.edit." +
                        "sections.signOnMethod.sections.authenticationFlow." +
                        "sections.scriptBased.editor.resetConfirmation.heading") }
                </ConfirmationModal.Header>
                <ConfirmationModal.Message
                    attached
                    warning
                    data-testid={ `${ testId }-reset-confirmation-modal-message` }>
                    { t("console:develop.features.applications.edit." +
                        "sections.signOnMethod.sections.authenticationFlow." +
                        "sections.scriptBased.editor.resetConfirmation.message") }
                </ConfirmationModal.Message>
                <ConfirmationModal.Content data-testid={ `${ testId }-reset-confirmation-modal-content` }>
                    { t("console:develop.features.applications.edit." +
                        "sections.signOnMethod.sections.authenticationFlow." +
                        "sections.scriptBased.editor.resetConfirmation.content") }
                </ConfirmationModal.Content>
            </ConfirmationModal>
        </>
    );
};

/**
 * Default props for the script based flow component.
 */
ScriptBasedFlow.defaultProps = {
    "data-testid": "script-based-flow",
    isMinimized: true
};
