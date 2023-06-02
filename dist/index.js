"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LoggerRawFormats = void 0;
const typed_emitter_1 = require("@br88c/typed-emitter");
/**
 * Raw formats for logging..
 */
exports.LoggerRawFormats = {
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
};
/**
 * The logger.
 * Used to simplify detailed logging.
 */
class Logger extends typed_emitter_1.TypedEmitter {
    /**
     * {@link LoggerOptions Options} for the logger.
     */
    options;
    /**
     * Create a logger.
     * @param options {@link LoggerOptions Logger options}.
     */
    constructor(options) {
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
    log(msg, options) {
        const completeOptions = {
            level: `INFO`,
            system: null,
            time: new Date(),
            ...this.options,
            ...options
        };
        const reset = exports.LoggerRawFormats.RESET;
        const formats = this._convertFormats(completeOptions.format);
        if (completeOptions.sanitizeTokens)
            [completeOptions.sanitizeTokens].flat().forEach((token) => {
                msg = msg.split(token.token).join(token.replacement);
            });
        if (completeOptions.templateLiteralFormats)
            msg = Object.keys(exports.LoggerRawFormats).reduce((p, c) => p.replaceAll(`%{${c}}`, exports.LoggerRawFormats[c]), msg);
        if ((completeOptions.enabledOutput.log === `ALL` ? [`DEBUG`, `INFO`, `WARN`, `ERROR`] : (completeOptions.enabledOutput.log ?? [`INFO`, `WARN`, `ERROR`])).includes(completeOptions.level))
            console.log([
                typeof completeOptions.showTime === `string` ? `${formats.timestamp}${completeOptions.showTime}` : (completeOptions.showTime ? `${formats.timestamp}${completeOptions.time.toLocaleString(...(completeOptions.showTime instanceof Array ? completeOptions.showTime : []))}` : undefined),
                `${formats.levels[completeOptions.level]}${completeOptions.level}`,
                completeOptions.system ? `${formats.system}${completeOptions.system}` : undefined,
                `${formats.message}${msg}${reset}`
            ].filter((str) => str !== undefined).join(` ${reset}${formats.divider}|${reset} `));
        if ((completeOptions.enabledOutput.events === `ALL` || !completeOptions.enabledOutput.events ? [`DEBUG`, `INFO`, `WARN`, `ERROR`] : completeOptions.enabledOutput.events).includes(completeOptions.level))
            this.emit(completeOptions.level, msg, completeOptions.system);
    }
    /**
     * Converts formats from options into physical console formats.
     * @param formats The formats to convert.
     */
    _convertFormats(formats) {
        const levelsAll = formats.levels?.ALL ?? `BRIGHT`;
        return {
            divider: this._combineFormats(formats.divider ?? `DIM`),
            timestamp: this._combineFormats(formats.timestamp ?? `WHITE`),
            levels: typeof formats.levels === `string` ? Object.fromEntries([`DEBUG`, `INFO`, `WARN`, `ERROR`].map((l) => [l, this._combineFormats(formats.levels)])) : {
                DEBUG: this._combineFormats(([formats.levels?.DEBUG ?? `WHITE`, levelsAll].flat())),
                INFO: this._combineFormats(([formats.levels?.INFO ?? `CYAN`, levelsAll].flat())),
                WARN: this._combineFormats(([formats.levels?.WARN ?? `YELLOW`, levelsAll].flat())),
                ERROR: this._combineFormats(([formats.levels?.ERROR ?? `RED`, levelsAll].flat()))
            },
            system: this._combineFormats(formats.system ?? [`BRIGHT`, `WHITE`]),
            message: this._combineFormats(formats.message ?? `WHITE`)
        };
    }
    /**
     * Combines formats into a single string of physical console formats.
     * @param formats The formats to combine.
     */
    _combineFormats(formats) {
        return typeof formats === `string` ? exports.LoggerRawFormats[formats] : formats.reduce((p, c) => `${p}${exports.LoggerRawFormats[c]}`, ``);
    }
}
exports.Logger = Logger;
