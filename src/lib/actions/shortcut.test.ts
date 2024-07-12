import {shortcutToString} from './shortcut.js'
import {describe, test, expect} from 'vitest'

describe('shortcutToString', () => {
    test('should return the correct string', () => {
        expect(shortcutToString({key: 'a', ctrl: true, alt: false, shift: false})).toBe('Ctrl+A')
        expect(shortcutToString({key: 'a', ctrl: true, alt: true, shift: false})).toBe('Ctrl+Alt+A')
        expect(shortcutToString({key: 'a', ctrl: true, alt: true, shift: true})).toBe('Ctrl+Alt+Shift+A')
        expect(shortcutToString({key: 'a', ctrl: false, alt: false, shift: false})).toBe('A')
    })
})
