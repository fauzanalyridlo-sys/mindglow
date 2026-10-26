import type { AccessoryId, Skin } from './momo-data'

export type EyeState = 'open' | 'happy' | 'sleep'

const EDGE = 'rgba(50, 60, 45, .5)'

export function CatSprite({
    eyes,
    eating,
    skin,
    accessory,
}: {
    eyes: EyeState
    eating: boolean
    skin: Skin
    accessory: AccessoryId
}) {
    const hat = accessory === 'topi' || accessory === 'mahkota'

    return (
        <svg
            className="momo-sprite"
            viewBox="0 0 160 150"
            shapeRendering="crispEdges"
            aria-hidden="true"
        >
            {/* ekor */}
            <g className="momo-tail">
                <rect x="108" y="114" width="26" height="16" fill={skin.accent} stroke={EDGE} strokeWidth="2" />
                <rect x="124" y="84" width="16" height="36" fill={skin.accent} stroke={EDGE} strokeWidth="2" />
                <rect x="124" y="98" width="16" height="6" fill={skin.accentD} />
                <rect x="124" y="84" width="16" height="10" fill={skin.fur} stroke={EDGE} strokeWidth="2" />
            </g>

            {/* badan */}
            <rect x="48" y="92" width="64" height="44" fill={skin.fur} stroke={EDGE} strokeWidth="2" />
            <rect x="50" y="124" width="60" height="10" fill={skin.shade} />
            <rect x="66" y="100" width="28" height="24" fill={skin.chest} opacity=".7" />
            <rect x="52" y="98" width="10" height="10" fill={skin.accent} />
            <rect x="98" y="106" width="10" height="10" fill={skin.accent} />

            {/* kaki depan */}
            <rect x="50" y="132" width="22" height="14" fill={skin.fur} stroke={EDGE} strokeWidth="2" />
            <rect x="88" y="132" width="22" height="14" fill={skin.fur} stroke={EDGE} strokeWidth="2" />
            <g fill={EDGE} opacity=".35">
                <rect x="58" y="138" width="2" height="8" />
                <rect x="64" y="138" width="2" height="8" />
                <rect x="96" y="138" width="2" height="8" />
                <rect x="102" y="138" width="2" height="8" />
            </g>

            {/* telinga */}
            <rect x="40" y="22" width="22" height="24" fill={skin.fur} stroke={EDGE} strokeWidth="2" />
            <rect x="45" y="28" width="10" height="14" fill={skin.ear} />
            <rect x="98" y="22" width="22" height="24" fill={skin.fur} stroke={EDGE} strokeWidth="2" />
            <rect x="105" y="28" width="10" height="14" fill={skin.ear} />

            {/* kepala */}
            <rect x="40" y="40" width="80" height="60" fill={skin.fur} stroke={EDGE} strokeWidth="2" />
            <rect x="96" y="42" width="22" height="14" fill={skin.accent} />
            <rect x="42" y="92" width="76" height="6" fill={skin.shade} />

            {/* tunas daun (hilang kalau pakai topi / mahkota) */}
            {!hat && (
                <g>
                    <rect x="78" y="30" width="4" height="12" fill="#5f9d54" />
                    <rect x="66" y="24" width="14" height="8" fill="#8fd18c" stroke={EDGE} strokeWidth="1.5" />
                    <rect x="82" y="20" width="14" height="8" fill="#8fd18c" stroke={EDGE} strokeWidth="1.5" />
                </g>
            )}

            {/* pipi */}
            <rect x="44" y="80" width="12" height="6" fill="#f7b0b4" opacity=".8" />
            <rect x="104" y="80" width="12" height="6" fill="#f7b0b4" opacity=".8" />

            {/* mata */}
            {eyes === 'open' && (
                <g className="momo-eyes">
                    <rect x="54" y="60" width="12" height="14" fill={skin.eye} />
                    <rect x="94" y="60" width="12" height="14" fill={skin.eye} />
                    <rect x="54" y="60" width="5" height="5" fill="#fff" />
                    <rect x="94" y="60" width="5" height="5" fill="#fff" />
                    <rect x="62" y="70" width="3" height="3" fill="#fff" opacity=".6" />
                    <rect x="102" y="70" width="3" height="3" fill="#fff" opacity=".6" />
                </g>
            )}
            {eyes === 'happy' && (
                <g fill={skin.lid}>
                    <rect x="54" y="70" width="4" height="4" />
                    <rect x="58" y="66" width="4" height="4" />
                    <rect x="62" y="70" width="4" height="4" />
                    <rect x="94" y="70" width="4" height="4" />
                    <rect x="98" y="66" width="4" height="4" />
                    <rect x="102" y="70" width="4" height="4" />
                </g>
            )}
            {eyes === 'sleep' && (
                <g fill={skin.lid}>
                    <rect x="54" y="68" width="12" height="4" />
                    <rect x="94" y="68" width="12" height="4" />
                </g>
            )}

            {/* hidung */}
            <rect x="74" y="76" width="12" height="6" fill={skin.nose} />

            {/* mulut */}
            {eating ? (
                <g>
                    <rect x="72" y="82" width="16" height="14" fill="#6b3a40" />
                    <rect x="76" y="90" width="8" height="6" fill="#f08fa0" />
                </g>
            ) : (
                <g fill={skin.mouth}>
                    <rect x="78" y="82" width="4" height="6" />
                    <rect x="70" y="84" width="4" height="4" />
                    <rect x="86" y="84" width="4" height="4" />
                    <rect x="74" y="88" width="12" height="4" />
                </g>
            )}

            {/* kumis */}
            <g fill="#9aa294">
                <rect x="20" y="76" width="20" height="2" />
                <rect x="20" y="84" width="20" height="2" />
                <rect x="120" y="76" width="20" height="2" />
                <rect x="120" y="84" width="20" height="2" />
            </g>

            {/* ===== aksesori ===== */}
            {accessory === 'syal' && (
                <g>
                    <rect x="44" y="96" width="72" height="10" fill="#e0443c" stroke={EDGE} strokeWidth="2" />
                    <rect x="52" y="96" width="6" height="10" fill="#b8302a" />
                    <rect x="68" y="96" width="6" height="10" fill="#b8302a" />
                    <rect x="84" y="96" width="6" height="10" fill="#b8302a" />
                    <rect x="98" y="104" width="14" height="24" fill="#e0443c" stroke={EDGE} strokeWidth="2" />
                    <rect x="98" y="116" width="14" height="4" fill="#b8302a" />
                </g>
            )}

            {accessory === 'kacamata' && (
                <g>
                    <rect x="50" y="58" width="20" height="18" fill="#1d1d1d" stroke={EDGE} strokeWidth="1.5" />
                    <rect x="90" y="58" width="20" height="18" fill="#1d1d1d" stroke={EDGE} strokeWidth="1.5" />
                    <rect x="70" y="64" width="20" height="4" fill="#1d1d1d" />
                    <rect x="53" y="61" width="6" height="3" fill="#fff" opacity=".45" />
                    <rect x="93" y="61" width="6" height="3" fill="#fff" opacity=".45" />
                </g>
            )}

            {accessory === 'topi' && (
                <g>
                    <rect x="52" y="38" width="56" height="6" fill="#6b3fc4" stroke={EDGE} strokeWidth="2" />
                    <rect x="62" y="30" width="36" height="8" fill="#7a4fd1" stroke={EDGE} strokeWidth="2" />
                    <rect x="70" y="22" width="20" height="8" fill="#7a4fd1" stroke={EDGE} strokeWidth="2" />
                    <rect x="76" y="14" width="8" height="8" fill="#8d63e0" stroke={EDGE} strokeWidth="2" />
                    <rect x="63" y="34" width="34" height="3" fill="#ffd23f" />
                    <rect x="78" y="25" width="4" height="4" fill="#ffd23f" />
                </g>
            )}

            {accessory === 'mahkota' && (
                <g>
                    <rect x="58" y="34" width="44" height="10" fill="#ffd23f" stroke={EDGE} strokeWidth="2" />
                    <rect x="58" y="26" width="10" height="8" fill="#ffd23f" stroke={EDGE} strokeWidth="2" />
                    <rect x="75" y="22" width="10" height="12" fill="#ffd23f" stroke={EDGE} strokeWidth="2" />
                    <rect x="92" y="26" width="10" height="8" fill="#ffd23f" stroke={EDGE} strokeWidth="2" />
                    <rect x="77" y="36" width="6" height="6" fill="#e0443c" />
                </g>
            )}
        </svg>
    )
}

/* Creeper imut (tidak meledak, cuma lewat) */
export function CreeperSprite() {
    return (
        <svg
            className="momo-creeper-sprite"
            viewBox="0 0 32 56"
            shapeRendering="crispEdges"
            aria-hidden="true"
        >
            <g fill="#5fae3b" stroke="rgba(0,0,0,.28)" strokeWidth="1">
                <rect x="4" y="0" width="24" height="24" />
                <rect x="8" y="24" width="16" height="20" />
                <rect x="6" y="44" width="8" height="12" />
                <rect x="18" y="44" width="8" height="12" />
            </g>
            <g fill="#4f9a2f">
                <rect x="6" y="2" width="4" height="4" />
                <rect x="22" y="18" width="4" height="4" />
                <rect x="12" y="28" width="4" height="4" />
                <rect x="8" y="46" width="4" height="4" />
            </g>
            <g fill="#78c24f">
                <rect x="20" y="2" width="4" height="4" />
                <rect x="9" y="36" width="4" height="4" />
                <rect x="20" y="46" width="4" height="4" />
            </g>
            <g fill="#1b2b17">
                <rect x="8" y="6" width="6" height="6" />
                <rect x="18" y="6" width="6" height="6" />
                <rect x="13" y="12" width="6" height="6" />
                <rect x="10" y="17" width="4" height="7" />
                <rect x="18" y="17" width="4" height="7" />
            </g>
        </svg>
    )
}