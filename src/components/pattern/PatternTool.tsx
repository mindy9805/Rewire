/** 依習慣設定渲染對應的互動工具 */
import type { PatternHabit } from '../../content/breakPattern';
import ValidationTool from './ValidationTool';
import ComfortMapTool from './ComfortMapTool';
import SpendingTool from './SpendingTool';
import QuietTool from './QuietTool';
import MicroCommitTool from './MicroCommitTool';
import EnvironmentTool from './EnvironmentTool';
import ChoiceSimTool from './ChoiceSimTool';

export default function PatternTool({ habit }: { habit: PatternHabit }) {
  const ids = habit.affirmationIds;
  switch (habit.tool) {
    case 'validation': return <ValidationTool affirmationIds={ids} />;
    case 'comfort': return <ComfortMapTool affirmationIds={ids} />;
    case 'spending': return <SpendingTool affirmationIds={ids} />;
    case 'quiet': return <QuietTool affirmationIds={ids} />;
    case 'commitment': return <MicroCommitTool affirmationIds={ids} />;
    case 'environment': return <EnvironmentTool affirmationIds={ids} />;
    case 'choice': return <ChoiceSimTool affirmationIds={ids} />;
  }
}
