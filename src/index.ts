import { TypedEmitter } from '@br88c/typed-emitter';

/**
 * A token filter.
 */
export interface TokenFilter {
    /**
     * The token to search for.
     */
    token: string
    /**
     * The token's replacement.
     */
    replacement: string
}

/**
 * Log events.
 */
export type LoggerEvents = Record<LoggerLevel, (msg: string, system: string | null) => void>

/**
 * A single logging format.
 */
export type LoggerFormat = keyof typeof LoggerRawFormats;

/**
 * A logging level.
 */
export type LoggerLevel = `DEBUG` | `INFO` | `WARN` | `ERROR`;

/**
 * Options for a log message.
 */
export interface LoggerMessageOptions extends Partial<LoggerOptions> {
    /**
     * The level to log at.
     * @default `INFO`
     */
    level?: LoggerLevel
    /**
     * The system creating the log.
     * `null` or `undefined` will omit logging a system.
     * @default null
     */
    system?: string | null
    /**
     * The time to record with the message.
     * If a string is provided, the string is used instead of generating a timestamp.
     */
    time?: Date | string
}

/**
 * {@link Logger} options.
 */
export interface LoggerOptions {
    /**
     * The logger's enabled output.
     * @default {}
     */
    enabledOutput?: {
        /**
         * The levels to output from `console.log()`.
         * @default [`INFO`, `WARN`, `ERROR`]
         */
        log?: LoggerLevel[] | `ALL`,
        /**
         * The levels to output from the logger's event emitter.
         * @default `ALL`
         */
        events?: LoggerLevel[] | `ALL`
    }
    /**
     * The format for the logger to use.
     * Note these only apply to the `console.log()`.
     * @default {}
     */
    format?: {
        /**
         * The format for the dividers.
         * @default `DIM`
         */
        divider?: LoggerFormat | LoggerFormat[]
        /**
         * The format for the timestamp.
         * @default `WHITE`
         */
        timestamp?: LoggerFormat | LoggerFormat[]
        /**
         * The format for the logging level.
         * @default {
         *   ALL: `BRIGHT`,
         *   DEBUG: `WHITE`,
         *   INFO: `CYAN`,
         *   WARN: `YELLOW`,
         *   ERROR: `RED`
         * }
         */
        levels?: Record<LoggerLevel | `ALL`, LoggerFormat | LoggerFormat[]> | LoggerFormat | LoggerFormat[]
        /**
         * The format for the system.
         * @default [`BRIGHT`, `WHITE`]
         */
        system?: LoggerFormat | LoggerFormat[]
        /**
         * The format for the message.
         * @default `WHITE`
         */
        message?: LoggerFormat | LoggerFormat[]
    }
    /**
     * Tokens / placeholder sets to sanitize messages with.
     * @default []
     */
    sanitizeTokens?: TokenFilter | TokenFilter[]
    /**
     * If the timestamp should be included in the `console.log()` message.
     * If a `true` is specified, `Date#toLocaleString` with no optional parameters is used. If an array is specified, they are used as spread parameters.
     * @default true
     */
    showTime?: boolean | Parameters<Date[`toLocaleString`]>
    /**
     * When true, the insertion of `%{FORMAT_KEY}` into a logging message will insert a format. `FORMAT_KEY` should be a key of {@link LoggerRawFormats}. Example: `This text is normal, %{GREEN}but this text is green!`
     * @default true
     */
    templateLiteralFormats?: boolean
}

/**
 * Raw formats for logging..
 */
export const LoggerRawFormats = {
    RESET: `\x1b[0m`,
    BRIGHT: `\x1b[1m`,
    DIM: `\x1b[2m`,
    ITALIC: `\x1b[3m`,
    UNDERSCORE: `\x1b[4m`,
    BLINK: `\x1b[5m`,
    REVERSE: `\x1b[7m`,
    HIDDEN: `\x1b[8m`,
    STRIKETHROUGH: `\x1b[9m`,

    BLACK: `\x1b[30m`,
    RED: `\x1b[31m`,
    GREEN: `\x1b[32m`,
    YELLOW: `\x1b[33m`,
    BLUE: `\x1b[34m`,
    MAGENTA: `\x1b[35m`,
    CYAN: `\x1b[36m`,
    WHITE: `\x1b[37m`,

    BG_BLACK: `\x1b[40m`,
    BG_RED: `\x1b[41m`,
    BG_GREEN: `\x1b[42m`,
    BG_YELLOW: `\x1b[43m`,
    BG_BLUE: `\x1b[44m`,
    BG_MAGENTA: `\x1b[45m`,
    BG_CYAN: `\x1b[46m`,
    BG_WHITE: `\x1b[47m`
} as const;

/**
 * The logger.
 * Used to simplify detailed logging.
 */
export class Logger extends TypedEmitter<LoggerEvents> {
    /**
     * {@link LoggerOptions Options} for the logger.
     */
    public readonly options: Required<LoggerOptions>;

    /**
     * Create a logger.
     * @param options {@link LoggerOptions Logger options}.
     */
    constructor (options: LoggerOptions) {
        super();

        this.options = {
            enabledOutput: options.enabledOutput ?? {},
            format: options.format ?? {},
            sanitizeTokens: options.sanitizeTokens ?? [],
            showTime: options.showTime ?? true,
            templateLiteralFormats: options.templateLiteralFormats ?? true
        };
    }

    /**
     * Log a message.
     * @param msg The message to be logged.
     * @param options The options for the message.
     */
    public log (msg: string, options?: LoggerMessageOptions): void {
        const completeOptions: Required<LoggerMessageOptions> = {
            level: `INFO`,
            system: null,
            time: new Date(),
            ...this.options,
            ...options
        } as any;

        const reset = LoggerRawFormats.RESET;
        const formats = this._convertFormats(completeOptions.format);

        if (completeOptions.sanitizeTokens) [completeOptions.sanitizeTokens].flat().forEach((token) => {
            msg = msg.split(token.token).join(token.replacement);
        });

        if (completeOptions.templateLiteralFormats) msg = (Object.keys(LoggerRawFormats) as Array<keyof typeof LoggerRawFormats>).reduce((p, c) => p.replaceAll(`%{${c}}`, LoggerRawFormats[c]), msg);

        if ((completeOptions.enabledOutput.log === `ALL` ? [`DEBUG`, `INFO`, `WARN`, `ERROR`] : (completeOptions.enabledOutput.log ?? [`INFO`, `WARN`, `ERROR`])).includes(completeOptions.level)) console.log([
            typeof completeOptions.showTime === `string` ? `${formats.timestamp}${completeOptions.showTime}` : (completeOptions.showTime ? `${formats.timestamp}${completeOptions.time.toLocaleString(...(completeOptions.showTime instanceof Array ? completeOptions.showTime as any : []))}` : undefined),
            `${formats.levels[completeOptions.level]}${completeOptions.level}`,
            completeOptions.system ? `${formats.system}${completeOptions.system}` : undefined,
            `${formats.message}${msg}${reset}`
        ].filter((str) => str !== undefined).join(` ${reset}${formats.divider}|${reset} `));

        if ((completeOptions.enabledOutput.events === `ALL` || !completeOptions.enabledOutput.events ? [`DEBUG`, `INFO`, `WARN`, `ERROR`] : completeOptions.enabledOutput.events).includes(completeOptions.level)) this.emit(completeOptions.level, msg, completeOptions.system);
    }

    /**
     * Converts formats from options into physical console formats.
     * @param formats The formats to convert.
     */
    private _convertFormats (formats: Required<LoggerOptions>[`format`]): {
         divider: string
         timestamp: string
         levels: Record<LoggerLevel, string>
         system: string
         message: string
     } {
        const levelsAll = (formats.levels as Record<`ALL`, LoggerFormat | LoggerFormat[]> | undefined)?.ALL ?? `BRIGHT`;

        return {
            divider: this._combineFormats(formats.divider ?? `DIM`),
            timestamp: this._combineFormats(formats.timestamp ?? `WHITE`),
            levels: typeof formats.levels === `string` ? Object.fromEntries([`DEBUG`, `INFO`, `WARN`, `ERROR`].map((l) => [l, this._combineFormats(formats.levels as LoggerFormat)])) as Record<LoggerLevel, string> : {
                DEBUG: this._combineFormats(([(formats.levels as Record<`DEBUG`, LoggerFormat | LoggerFormat[]> | undefined)?.DEBUG ?? `WHITE`, levelsAll].flat())),
                INFO: this._combineFormats(([(formats.levels as Record<`INFO`, LoggerFormat | LoggerFormat[]> | undefined)?.INFO ?? `CYAN`, levelsAll].flat())),
                WARN: this._combineFormats(([(formats.levels as Record<`WARN`, LoggerFormat | LoggerFormat[]> | undefined)?.WARN ?? `YELLOW`, levelsAll].flat())),
                ERROR: this._combineFormats(([(formats.levels as Record<`ERROR`, LoggerFormat | LoggerFormat[]> | undefined)?.ERROR ?? `RED`, levelsAll].flat()))
            },
            system: this._combineFormats(formats.system ?? [`BRIGHT`, `WHITE`]),
            message: this._combineFormats(formats.message ?? `WHITE`)
        };
    }

    /**
     * Combines formats into a single string of physical console formats.
     * @param formats The formats to combine.
     */
    private _combineFormats (formats: LoggerFormat | LoggerFormat[]): string {
        return typeof formats === `string` ? LoggerRawFormats[formats] : formats.reduce((p, c) => `${p}${LoggerRawFormats[c]}`, ``);
    }
}
