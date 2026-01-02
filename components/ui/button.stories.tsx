import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

/**
 * shadcn/ui Button Component
 * 
 * A button component that supports multiple variants, sizes, and states.
 * Built with class-variance-authority for consistent styling.
 */
const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays a button or a component that looks like a button. Inherits from shadcn/ui with zero custom overrides.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Merge props with child element',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default primary button - most commonly used for main actions
 */
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

/**
 * Destructive variant - used for dangerous or delete actions
 */
export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

/**
 * Outline variant - secondary actions with a border
 */
export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

/**
 * Secondary variant - less prominent than default
 */
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

/**
 * Ghost variant - minimal styling, useful for less important actions
 */
export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

/**
 * Link variant - looks like a hyperlink
 */
export const Link: Story = {
  args: {
    children: 'Link',
    variant: 'link',
  },
};

/**
 * Small size button
 */
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

/**
 * Large size button
 */
export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

/**
 * Icon-only button (square)
 */
export const Icon: Story = {
  args: {
    children: '🔍',
    size: 'icon',
  },
};

/**
 * Disabled state - button cannot be interacted with
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

/**
 * All variants displayed together for visual comparison
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </div>
  ),
};

/**
 * All sizes displayed together for visual comparison
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔍</Button>
    </div>
  ),
};

/**
 * Dark mode compatibility test
 */
export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-slate-950 p-8 rounded-lg">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
    </div>
  ),
};

/**
 * Responsive layout test - buttons should maintain proper spacing
 */
export const Responsive: Story = {
  render: () => (
    <div className="w-full max-w-sm flex flex-col gap-2">
      <Button className="w-full">Full Width Button</Button>
      <div className="flex gap-2">
        <Button className="flex-1">Half</Button>
        <Button className="flex-1">Half</Button>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1">Third</Button>
        <Button className="flex-1">Third</Button>
        <Button className="flex-1">Third</Button>
      </div>
    </div>
  ),
};

/**
 * Interactive states - hover, focus, active
 */
export const InteractiveStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <p className="text-sm font-medium mb-2">Hover over these buttons:</p>
        <div className="flex gap-2">
          <Button>Hover Me</Button>
          <Button variant="outline">Hover Me</Button>
          <Button variant="destructive">Hover Me</Button>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Tab to focus (should show focus ring):</p>
        <div className="flex gap-2">
          <Button>Focus Me</Button>
          <Button variant="outline">Focus Me</Button>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Click and hold (active state):</p>
        <div className="flex gap-2">
          <Button>Press Me</Button>
          <Button variant="outline">Press Me</Button>
        </div>
      </div>
    </div>
  ),
};
