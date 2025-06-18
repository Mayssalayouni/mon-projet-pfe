// translate-wrapper.mjs
import translate from 'translate';

translate.engine = 'google';
translate.key = undefined;

export async function traduire(text, options) {
    return await translate(text, options);
}
