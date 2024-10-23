import * as React from 'react';
import Markdown from 'markdown-to-jsx';
import classNames from 'classnames';

import { getComponent } from '../../components-registry';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import Section from '../Section';
import TitleBlock from '../../blocks/TitleBlock';
import { Action, Badge } from '../../atoms';

export default function GenericSection(props) {
    const { elementId, colors, backgroundImage, badge, title, subtitle, text, actions = [], media, styles = {}, enableAnnotations } = props;
    const flexDirection = styles?.self?.flexDirection ?? 'row';
    const alignItems = styles?.self?.alignItems ?? 'flex-start';
    const hasTextContent = !!(badge?.url || title?.text || subtitle || text || actions.length > 0);
    const hasMedia = !!(media && (media?.url || (media?.fields ?? []).length > 0) || (media?.title));
    const hasXDirection = flexDirection === 'row' || flexDirection === 'row-reverse';

    return (
        <Section
            elementId={elementId}
            className="sb-component-generic-section"
            colors={colors}
            backgroundImage={backgroundImage}
            styles={styles?.self}
            {...getDataAttrs(props)}
        >
            <div
                className={classNames(
                    'w-full',
                    'flex',
                    mapFlexDirectionStyles(flexDirection, hasTextContent, hasMedia),
                    /* handle horizontal positioning of content on small screens or when direction is col or col-reverse, mapping justifyContent to alignItems instead since it's a flex column */
                    mapStyles({ alignItems: styles?.self?.justifyContent ?? 'flex-start' }),
                    /* handle vertical positioning of content on large screens if it's a two col layout */
                    hasMedia && hasTextContent && hasXDirection ? mapAlignItemsStyles(alignItems) : undefined,
                    'gap-x-6',
                    'gap-y-6'
                )}
            >
                {hasMedia && (
                    <div
                        className={classNames('w-full', 'flex', mapStyles({ justifyContent: styles?.self?.justifyContent ?? 'flex-start' }), {
                            'max-w-sectionBody': media.__metadata.modelName === 'FormBlock',
                            'md:max-w-[27.5rem] lg:shrink-0': media.__metadata.modelName === 'CardBlock',
                            'md:w-[57.5%] lg:shrink-0': hasTextContent && hasXDirection && !(media.__metadata.modelName === 'CardBlock' ),
                            'md:mt-10': badge?.label && (media.__metadata.modelName === 'FormBlock' ) && hasXDirection
                        })}
                    >
                        <Media media={media} hasAnnotations={enableAnnotations} />
                    </div>
                )}
                {hasTextContent && (
                    <div
                        className={classNames('w-full', 'max-w-sectionBody', 'p-4' , {
                            'md:max-w-[27.5rem]': hasMedia && hasXDirection && !(media.__metadata.modelName === 'CardBlock' ),
                            'md:max-w-[57.5%]': media && media?.__metadata.modelName === 'CardBlock',
                        })}
                    >
                        {badge && <Badge {...badge} {...(enableAnnotations && { 'data-sb-field-path': '.badge' })} />}
                        {title && (
                            <TitleBlock
                                {...title}
                                className={classNames("text-3xl",'lg:text-5xl',{ 'mt-4': badge?.label })}
                                {...(enableAnnotations && { 'data-sb-field-path': '.title' })}
                            />
                        )}
                        {subtitle && (
                            <p
                                className={classNames('text-lg', styles?.subtitle ? mapStyles(styles?.subtitle) : undefined)}
                                {...(enableAnnotations && { 'data-sb-field-path': '.subtitle' })}
                            >
                                {subtitle}
                            </p>
                        )}
                        {text && (
                            <Markdown
                                options={{ forceBlock: true, forceWrapper: true }}
                                className={classNames('sb-markdown', styles?.text ? mapStyles(styles?.text) : undefined, {
                                    'mt-6': badge?.label || title?.text || subtitle
                                })}
                                {...(enableAnnotations && { 'data-sb-field-path': '.text' })}
                            >
                                {text}
                            </Markdown>
                        )}
                        {actions.length > 0 && (
                            <div
                                className={classNames(
                                    'flex',
                                    'flex-wrap',
                                    mapStyles({ justifyContent: styles?.self?.justifyContent ?? 'flex-start' }),
                                    'items-center',
                                    'gap-4',
                                    {
                                        'mt-8': badge?.label || title?.text || subtitle || text
                                    }
                                )}
                                {...(enableAnnotations && { 'data-sb-field-path': '.actions' })}
                            >
                                {actions.map((action, index) => (
                                    <Action
                                        key={index}
                                        {...action}
                                        className="lg:whitespace-nowrap"
                                        {...(enableAnnotations && { 'data-sb-field-path': `.${index}` })}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Section>
    );
}

function Media({ media, hasAnnotations }: { media: any; hasAnnotations: boolean }) {
    const modelName = media.__metadata.modelName;
    if (!modelName) {
        throw new Error(`generic section media does not have the 'modelName' property`);
    }
    const MediaComponent = getComponent(modelName);
    if (!MediaComponent) {
        throw new Error(`no component matching the hero section media model name: ${modelName}`);
    }
    return <MediaComponent {...media} {...(hasAnnotations && { 'data-sb-field-path': '.media' })} />;
}

function mapFlexDirectionStyles(flexDirection: string, hasTextContent: boolean, hasMedia: boolean) {
    switch (flexDirection) {
        case 'row':
            return hasTextContent && hasMedia ? 'flex-col md:flex-row md:justify-between' : 'flex-col';
        case 'row-reverse':
            return hasTextContent && hasMedia ? 'flex-col md:flex-row-reverse md:justify-between' : 'flex-col';
        case 'col':
            return 'flex-col';
        case 'col-reverse':
            return 'flex-col-reverse';
        default:
            return null;
    }
}

function mapAlignItemsStyles(alignItems: string) {
    switch (alignItems) {
        case 'flex-start':
            return 'md:items-start';
        case 'flex-end':
            return 'md:items-end';
        case 'center':
            return 'md:items-center';
        default:
            return null;
    }
}
