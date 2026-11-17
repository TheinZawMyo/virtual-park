import Atmosphere from './Atmosphere'
import Terrain from './Terrain'
import Roads from './Roads'
import Skyline from './Skyline'
import Vegetation from './Vegetation'
import Markers from './Markers'
import Player from './Player'
import OtherPlayers from './OtherPlayers'
import { Bench, InfoBoard, Lamppost, Pagoda } from './Props'
import { BENCHES, LAMPS } from '../../game/layout'
import { TIME_PRESETS } from '../../game/presets'

export default function Scene({ settings, onInteract, remotePlayers, localPlayerId, avatarType, avatarColor }) {
  const shadows = settings.shadows
  const preset = TIME_PRESETS[settings.timeOfDay]

  return (
    <>
      <Atmosphere timeOfDay={settings.timeOfDay} shadows={shadows} />
      <Terrain shadows={shadows} />
      <Roads />
      <Skyline shadows={shadows} glow={preset.lamp} />
      <Vegetation shadows={shadows} />

      {BENCHES.map((bench) => (
        <Bench key={bench.id} bench={bench} shadows={shadows} />
      ))}
      {LAMPS.map((lamp, index) => (
        <Lamppost
          key={index}
          lamp={lamp}
          shadows={shadows}
          lampIntensity={preset.lamp}
        />
      ))}
      <InfoBoard shadows={shadows} />
      <Pagoda shadows={shadows} glow={preset.lamp} />

      {settings.showMarkers && <Markers />}

      <Player shadows={shadows} onInteract={onInteract} avatarType={avatarType} avatarColor={avatarColor} />

      {remotePlayers.length > 0 && (
        <OtherPlayers players={remotePlayers} localPlayerId={localPlayerId} />
      )}
    </>
  )
}
