import { TypedEmitter } from '@br88c/typed-emitter';
/**
 * A token filter.
 */
export interface TokenFilter {
    /**
     * The token to search for.
     */
    token: string;
    /**
     * The token's replacement.
     */
    replacement: string;
}
/**
 * Log events.
 */
export type LoggerEvents = Record<LoggerLevel, (msg: string, system: string | null) => void>;
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
    level?: LoggerLevel;
    /**
     * The system creating the log.
     * `null` or `undefined` will omit logging a system.
     * @default null
     */
    system?: string | null;
    /**
     * The time to record with the message.
     * If a string is provided, the string is used instead of generating a timestamp.
     */
    time?: Date | string;
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
        log?: LoggerLevel[] | `ALL`;
        /**
         * The levels to output from the logger's event emitter.
         * @default `ALL`
         */
        events?: LoggerLevel[] | `ALL`;
    };
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
        divider?: LoggerFormat | LoggerFormat[];
        /**
         * The format for the timestamp.
         * @default `WHITE`
         */
        timestamp?: LoggerFormat | LoggerFormat[];
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
        levels?: Record<LoggerLevel | `ALL`, LoggerFormat | LoggerFormat[]> | LoggerFormat | LoggerFormat[];
        /**
         * The format for the system.
         * @default [`BRIGHT`, `WHITE`]
         */
        system?: LoggerFormat | LoggerFormat[];
        /**
         * The format for the message.
         * @default `WHITE`
         */
        message?: LoggerFormat | LoggerFormat[];
    };
    /**
     * Tokens / placeholder sets to sanitize messages with.
     * @default []
     */
    sanitizeTokens?: TokenFilter | TokenFilter[];
    /**
     * If the timestamp should be included in the `console.log()` message.
     * If a `true` is specified, `Date#toLocaleString` with no optional parameters is used. If an array is specified, they are used as spread parameters.
     * @default true
     */
    showTime?: boolean | Parameters<Date[`toLocaleString`]>;
    /**
     * When true, the insertion of `%{FORMAT_KEY}` into a logging message will insert a format. `FORMAT_KEY` should be a key of {@link LoggerRawFormats}. Example: `This text is normal, %{GREEN}but this text is green!`
     * @default true
     */
    templateLiteralFormats?: boolean;
}
/**
 * Raw formats for logging..
 */
export declare const LoggerRawFormats: {
    readonly RESET: "\u001B[0m";
    readonly BRIGHT: "\u001B[1m";
    readonly DIM: "\u001B[2m";
    readonly ITALIC: "\u001B[3m";
    readonly UNDERSCORE: "\u001B[4m";
    readonly BLINK: "\u001B[5m";
    readonly REVERSE: "\u001B[7m";
    readonly HIDDEN: "\u001B[8m";
    readonly STRIKETHROUGH: "\u001B[9m";
    readonly BLACK: "\u001B[30m";
    readonly RED: "\u001B[31m";
    readonly GREEN: "\u001B[32m";
    readonly YELLOW: "\u001B[33m";
    readonly BLUE: "\u001B[34m";
    readonly MAGENTA: "\u001B[35m";
    readonly CYAN: "\u001B[36m";
    readonly WHITE: "\u001B[37m";
    readonly BG_BLACK: "\u001B[40m";
    readonly BG_RED: "\u001B[41m";
    readonly BG_GREEN: "\u001B[42m";
    readonly BG_YELLOW: "\u001B[43m";
    readonly BG_BLUE: "\u001B[44m";
    readonly BG_MAGENTA: "\u001B[45m";
    readonly BG_CYAN: "\u001B[46m";
    readonly BG_WHITE: "\u001B[47m";
};
/**
 * The logger.
 * Used to simplify detailed logging.
 */
export declare class Logger extends TypedEmitter<LoggerEvents> {
    /**
     * {@link LoggerOptions Options} for the logger.
     */
    readonly options: Required<LoggerOptions>;
    /**
     * Create a logger.
     * @param options {@link LoggerOptions Logger options}.
     */
    constructor(options: LoggerOptions);
    /**
     * Log a message.
     * @param msg The message to be logged.
     * @param options The options for the message.
     */
    log(msg: string, options?: LoggerMessageOptions): void;
    /**
     * Converts formats from options into physical console formats.
     * @param formats The formats to convert.
     */
    private _convertFormats;
    /**
     * Combines formats into a single string of physical console formats.
     * @param formats The formats to combine.
     */
    private _combineFormats;
}
