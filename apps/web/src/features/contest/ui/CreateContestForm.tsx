/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Plus,
  X,
  ChevronsUpDown,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CreateContest,
  CreateContestSchema,
  DifficultySchema,
} from "@/features/contest/types";
import {
  Challenge,
  CreateChallenge,
  CreateChallengeSchema,
} from "@/features/challenge/types";
import CreateChallengeForm from "@/features/challenge/ui/CreateChallengeForm";

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

const CreateContestForm = () => {
  const [open, setOpen] = useState(false);
  const [attachedChallenges, setAttachedChallenges] = useState<AttachedChallenge[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNewChallengeForm, setShowNewChallengeForm] = useState(false);

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

  const { register: registerChallenge, reset: resetChallenge } =
    useForm<CreateChallenge>({
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

  const existingChallenges: any[] = [];

  function attachExisting(challenge: Challenge) {
    setAttachedChallenges((prev) => [
      ...prev,
      {
        id: challenge.challenge_id,
        title: challenge.title,
        difficulty: challenge.difficulty,
        maxPoints: challenge.max_points,
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
    console.log("Create contest:", {
      ...values,
      challenges: attachedChallenges,
    });

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
        <Button size="sm" className="gap-1.5 cursor-pointer">
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
            <form
              id="contest-form"
              onSubmit={handleSubmit(onSubmit)}
              className="pb-2"
            >
              <FieldGroup>
                <Field data-invalid={!!errors.title}>
                  <FieldLabel htmlFor="contest-title">Title</FieldLabel>
                  <Input
                    {...register("title")}
                    id="contest-title"
                    aria-invalid={!!errors.title}
                    placeholder="e.g. Backend Blitz #13"
                  />
                  {errors.title && <FieldError errors={[errors.title]} />}
                </Field>

                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="contest-description">
                    Description
                  </FieldLabel>
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
                            {field.value ? (
                              format(field.value, "PPP p")
                            ) : (
                              <span>Pick a date</span>
                            )}
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">
                    Challenges
                  </h4>
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
                          <span className="text-sm text-foreground truncate">
                            {c.title}
                          </span>
                          {c.isNew && (
                            <Badge variant="secondary" className="text-[10px]">
                              New
                            </Badge>
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
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <Command
                      filter={(value, search) => {
                        const challenge = existingChallenges.find(
                          (c) => c.id === value,
                        );
                        if (!challenge) return 0;
                        return challenge.title
                          .toLowerCase()
                          .includes(search.toLowerCase())
                          ? 1
                          : 0;
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
                            <span className="text-primary font-medium">
                              Create New Challenge
                            </span>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Separator className="my-5" />

              <Field orientation="horizontal" className="justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Create Contest
                </Button>
              </Field>
            </form>
          ) : (
            <CreateChallengeForm
              setShowNewChallengeForm={setShowNewChallengeForm}
              onAddNewChallenge={onAddNewChallenge}
              registerChallenge={registerChallenge}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContestForm;
