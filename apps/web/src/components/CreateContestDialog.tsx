import { useState } from "react";
import z from 'zod';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Plus,
  X,
  Check,
  ChevronsUpDown,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockChallenges } from "@/data/mockData";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateChallenge, CreateChallengeSchema, CreateContest, CreateContestSchema, DifficultySchema } from "@/features/contest/types";

interface AttachedChallenge {
  id: string;
  title: string;
  difficulty: z.infer<typeof DifficultySchema>;
  maxPoints: number;
  isNew?: boolean;
}

const difficultyColors: Record<string, string> = {
  EASY: "bg-success/15 text-success border-success/30",
  MEDIUM: "bg-warning/15 text-warning border-warning/30",
  HARD: "bg-destructive/15 text-destructive border-destructive/30",
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateContestDialog() {
  const [open, setOpen] = useState(false);
  const [attachedChallenges, setAttachedChallenges] = useState<AttachedChallenge[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNewChallengeForm, setShowNewChallengeForm] = useState(false);

  // ── Contest form ──────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateContest>({
    resolver: zodResolver(CreateContestSchema),
    defaultValues: { title: "", description: "" },
  });

  // ── Challenge form ────────────────────────────────────────────────────────
  const {
    register: registerChallenge,
    handleSubmit: handleSubmitChallenge,
    control: challengeControl,
    reset: resetChallenge,
    formState: { errors: challengeErrors },
  } = useForm<CreateChallenge>({
    resolver: zodResolver(CreateChallengeSchema),
    // defaultValues: {
    //   title: "",
    //   description: "",
    //   difficulty: "EASY",
    //   max_points: 100,
    //   notion_doc_id: null,
    //   s3_prefix: "",
    //   allowed_deps: "{}",
    // },
  });

  const existingChallenges = mockChallenges.filter(
    (c) => !attachedChallenges.some((a) => a.id === c.id),
  );

  function attachExisting(challenge: (typeof mockChallenges)[0]) {
    setAttachedChallenges((prev) => [
      ...prev,
      {
        id: challenge.id,
        title: challenge.title,
        difficulty: challenge.difficulty,
        maxPoints: challenge.maxPoints,
      },
    ]);
    setDropdownOpen(false);
  }

  function removeAttached(id: string) {
    setAttachedChallenges((prev) => prev.filter((c) => c.id !== id));
  }

  function onAddNewChallenge(values: CreateChallenge) {
    setAttachedChallenges((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: values.title,
        difficulty: values.difficulty,
        maxPoints: values.max_points,
        isNew: true,
      },
    ]);
    resetChallenge();
    setShowNewChallengeForm(false);
  }

  function onSubmit(values: CreateContest) {
    console.log("Create contest:", { ...values, challenges: attachedChallenges });
    
    reset();
    setAttachedChallenges([]);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setShowNewChallengeForm(false);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Create Contest
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-hidden flex flex-col bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Create New Contest
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details and attach challenges to your contest.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          {!showNewChallengeForm ? (
            // ── Contest Form ──────────────────────────────────────────────
            <form
              id="contest-form"
              onSubmit={handleSubmit(onSubmit)}
              className="pb-2"
            >
              <FieldGroup>

                {/* Title */}
                <Field data-invalid={!!errors.title}>
                  <FieldLabel htmlFor="contest-title">Title</FieldLabel>
                  <Input
                    {...register("title")}
                    id="contest-title"
                    aria-invalid={!!errors.title}
                    placeholder="e.g. Backend Blitz #13"
                  />
                  {errors.title && (
                    <FieldError errors={[errors.title]} />
                  )}
                </Field>

                {/* Description */}
                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="contest-description">Description</FieldLabel>
                  <Textarea
                    {...register("description")}
                    id="contest-description"
                    aria-invalid={!!errors.description}
                    placeholder="Describe your contest..."
                    rows={3}
                  />
                  {errors.description && (
                    <FieldError errors={[errors.description]} />
                  )}
                </Field>

                {/* Start Time */}
                <Controller
                  name="start_time"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Start Time</FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            aria-invalid={fieldState.invalid}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? format(field.value, "PPP p")
                              : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date)}
                            disabled={{ before: new Date() }}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

              </FieldGroup>

              <Separator className="my-5" />

              {/* Challenges Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Challenges</h4>
                  <span className="text-xs text-muted-foreground">
                    {attachedChallenges.length} attached
                  </span>
                </div>

                {attachedChallenges.length > 0 && (
                  <div className="space-y-2">
                    {attachedChallenges.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] shrink-0 capitalize",
                              difficultyColors[c.difficulty],
                            )}
                          >
                            {c.difficulty}
                          </Badge>
                          <span className="text-sm text-foreground truncate">{c.title}</span>
                          {c.isNew && (
                            <Badge variant="secondary" className="text-[10px]">New</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground font-mono">
                            {c.maxPoints}pts
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttached(c.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={dropdownOpen}
                      className="w-full justify-between font-normal text-muted-foreground"
                    >
                      Select a challenge to attach...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command
                      filter={(value, search) => {
                        const challenge = existingChallenges.find((c) => c.id === value);
                        if (!challenge) return 0;
                        return challenge.title.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                      }}
                    >
                      <CommandInput placeholder="Search challenges..." />
                      <CommandList>
                        <CommandEmpty>No challenges found.</CommandEmpty>
                        <CommandGroup heading="Existing Challenges">
                          {existingChallenges.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.id}
                              onSelect={() => attachExisting(c)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] shrink-0 capitalize",
                                    difficultyColors[c.difficulty],
                                  )}
                                >
                                  {c.difficulty}
                                </Badge>
                                <span className="truncate">{c.title}</span>
                              </div>
                              <span className="text-xs text-muted-foreground font-mono shrink-0">
                                {c.maxPoints}pts
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            value="__create_new__"
                            onSelect={() => {
                              setDropdownOpen(false);
                              setShowNewChallengeForm(true);
                            }}
                            className="cursor-pointer"
                          >
                            <PlusCircle className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-primary font-medium">Create New Challenge</span>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Separator className="my-5" />

              <Field orientation="horizontal" className="justify-end">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Contest</Button>
              </Field>
            </form>
          ) : (
            // ── New Challenge Form ────────────────────────────────────────
            <div className="space-y-5 pb-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewChallengeForm(false)}
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

                  {/* Title */}
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

                  {/* Description */}
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

                  {/* Difficulty + Max Points side by side */}
                  <div className="grid grid-cols-2 gap-3">

                    {/* Difficulty — shadcn Select is not a native input, use Controller */}
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
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    {/* Max Points */}
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

                  {/* Notion Doc ID */}
                  <Controller
                    name="notion_doc_id"
                    control={challengeControl}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>
                          Notion Doc ID{" "}
                          <span className="font-normal text-muted-foreground">(optional)</span>
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

                  {/* S3 Prefix */}
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

                  {/* Allowed Dependencies */}
                  <Field data-invalid={!!challengeErrors.allowed_deps}>
                    <FieldLabel htmlFor="challenge-allowed-deps">
                      Allowed Dependencies{" "}
                      <span className="font-normal text-muted-foreground">(JSON)</span>
                    </FieldLabel>
                    <Textarea
                      {...registerChallenge("allowed_deps")}
                      id="challenge-allowed-deps"
                      aria-invalid={!!challengeErrors.allowed_deps}
                      rows={2}
                      placeholder='{"express": "^4.18", "zod": "^3.22"}'
                      className="font-mono text-sm"
                    />
                    <FieldDescription>
                      Provide a JSON object mapping package names to version ranges.
                    </FieldDescription>
                    {challengeErrors.allowed_deps && (
                      <FieldError errors={[challengeErrors.allowed_deps]} />
                    )}
                  </Field>

                </FieldGroup>

                <Field orientation="horizontal" className="justify-end mt-5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowNewChallengeForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Add Challenge
                  </Button>
                </Field>
              </form>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}