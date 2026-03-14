import useStore from '../store/useStore'
import AgentCharacter from '../scene/AgentCharacter'
import DelegationLine from './DelegationLine'

// Agent IDs are static — never added/removed at runtime
const AGENT_IDS = ['kim', 'dev', 'marco', 'zara', 'riley', 'dante', 'sam', 'petra', 'lex', 'bruno']

export default function AgentGroup() {
  const delegations = useStore((s) => s.delegations)

  return (
    <group>
      {AGENT_IDS.map((id) => (
        <AgentCharacter key={id} agentId={id} />
      ))}

      {/* Delegation lines between agents */}
      {delegations.map((d) => (
        <DelegationLine
          key={d.timestamp}
          from={d.from}
          to={d.to}
          fromColor={d.fromColor}
          toColor={d.toColor}
          timestamp={d.timestamp}
        />
      ))}
    </group>
  )
}
