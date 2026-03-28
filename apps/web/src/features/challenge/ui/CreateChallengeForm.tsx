import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateChallenge,
  CreateChallengeSchema,
} from "@/features/challenge/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm, UseFormRegister } from "react-hook-form";

interface CreateChallengeFormProps {
  setShowNewChallengeForm: React.Dispatch<React.SetStateAction<boolean>>;
  onAddNewChallenge: (values: CreateChallenge) => void;
  registerChallenge: UseFormRegister<CreateChallenge>;
}

const CreateChallengeForm = ({
  setShowNewChallengeForm,
  onAddNewChallenge,
}: CreateChallengeFormProps) => {
  const {
    register: registerChallenge,
    handleSubmit: handleSubmitChallenge,
    control: challengeControl,
    formState: { errors: challengeErrors },
  } = useForm<CreateChallenge>({
    resolver: zodResolver(CreateChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "EASY",
      max_points: 100,
      notion_doc_id: null,
      s3_prefix: "",
    },
  });

  return (
    <div className="space-y-5 pb-2 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
      <div className="flex items-center gap-2 cursor-pointer">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowNewChallengeForm(false)}
          className="cursor-pointer"
        >
          ← Back
        </Button>
        <h4 className="text-sm font-heading font-semibold text-foreground">
          Create New Challenge
        </h4>
      </div>
      <form
        id="challenge-form"
        onSubmit={handleSubmitChallenge(onAddNewChallenge)}
      >
        <FieldGroup>
          <Field data-invalid={!!challengeErrors.title}>
            <FieldLabel htmlFor="challenge-title">Title</FieldLabel>
            <Input
              {...registerChallenge("title")}
              id="challenge-title"
              aria-invalid={!!challengeErrors.title}
              placeholder="Challenge title"
            />
            {challengeErrors.title && (
              <FieldError errors={[challengeErrors.title]} />
            )}
          </Field>

          <Field data-invalid={!!challengeErrors.description}>
            <FieldLabel htmlFor="challenge-description">Description</FieldLabel>
            <Textarea
              {...registerChallenge("description")}
              id="challenge-description"
              aria-invalid={!!challengeErrors.description}
              placeholder="Describe the challenge..."
              rows={3}
            />
            {challengeErrors.description && (
              <FieldError errors={[challengeErrors.description]} />
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="difficulty"
              control={challengeControl}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Difficulty</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field data-invalid={!!challengeErrors.max_points}>
              <FieldLabel htmlFor="challenge-max-points">Max Points</FieldLabel>
              <Input
                {...registerChallenge("max_points")}
                id="challenge-max-points"
                type="number"
                aria-invalid={!!challengeErrors.max_points}
              />
              {challengeErrors.max_points && (
                <FieldError errors={[challengeErrors.max_points]} />
              )}
            </Field>
          </div>

          <Controller
            name="notion_doc_id"
            control={challengeControl}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Notion Doc ID{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  id="challenge-notion-doc-id"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. abc123-def456"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field data-invalid={!!challengeErrors.s3_prefix}>
            <FieldLabel htmlFor="challenge-s3-prefix">S3 Prefix</FieldLabel>
            <Input
              {...registerChallenge("s3_prefix")}
              id="challenge-s3-prefix"
              aria-invalid={!!challengeErrors.s3_prefix}
              placeholder="e.g. challenges/my-challenge/"
              className="font-mono text-sm"
            />
            {challengeErrors.s3_prefix && (
              <FieldError errors={[challengeErrors.s3_prefix]} />
            )}
          </Field>
        </FieldGroup>

        <Field orientation="horizontal" className="justify-end mt-5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowNewChallengeForm(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button type="submit" className="gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Add Challenge
          </Button>
        </Field>
      </form>
    </div>
  );
};

export default CreateChallengeForm;
