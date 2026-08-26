import { Plus, Save, Trash2 } from "lucide-react";
import Button from "/src/components/ui/Button";
import IconButton from "/src/components/ui/IconButton";
import Input from "/src/components/ui/Input";
import Select from "/src/components/ui/Select";

const VARIANTS = ["primary", "secondary", "danger"] as const;
const SIZES = ["sm", "md", "lg"] as const;

export default function KitPage() {
  return (
    <main className="flex flex-col gap-2xl p-2xl bg-background text-on-surface">
      <section className="flex flex-col gap-lg">
        <h2 className="text-h2">Button</h2>
        {VARIANTS.map((variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-md">
            <span className="text-caption text-on-surface-variant w-20">
              {variant}
            </span>
            {SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {size.toUpperCase()} Button
              </Button>
            ))}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-md">
          <span className="text-caption text-on-surface-variant w-20">
            states
          </span>
          <Button leftIcon={<Save size={16} />}>With left icon</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="flex flex-col gap-lg">
        <h2 className="text-h2">IconButton</h2>
        <div className="flex flex-wrap items-center gap-md">
          {VARIANTS.map((variant) => (
            <IconButton
              key={variant}
              variant={variant}
              label={`${variant} action`}
              icon={<Plus size={18} />}
            />
          ))}
          <IconButton label="Loading action" icon={<Plus size={18} />} loading />
          <IconButton
            label="Disabled action"
            icon={<Trash2 size={18} />}
            disabled
          />
        </div>
      </section>

      <section className="flex flex-col gap-lg max-w-sm">
        <h2 className="text-h2">Input</h2>
        <Input
          label="Email address"
          required
          placeholder="you@example.com"
          helper="We'll never share your email."
        />
        <Input
          label="Username"
          required
          defaultValue="bad username!"
          error="Usernames can only contain letters, numbers, and underscores."
        />
        <Input label="Disabled field" disabled defaultValue="Can't edit this" />
      </section>

      <section className="flex flex-col gap-lg max-w-sm">
        <h2 className="text-h2">Select</h2>
        <Select
          label="Role"
          required
          placeholder="Choose a role"
          defaultValue=""
          options={[
            { value: "admin", label: "Admin" },
            { value: "tutor", label: "Tutor" },
            { value: "student", label: "Student" },
          ]}
          helper="You can change this later."
        />
        <Select
          label="Session"
          defaultValue=""
          error="Please select a session."
          options={[
            { value: "s1", label: "Session 1" },
            { value: "s2", label: "Session 2" },
          ]}
        />
      </section>
    </main>
  );
}
