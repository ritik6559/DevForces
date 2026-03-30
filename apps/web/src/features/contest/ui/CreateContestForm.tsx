import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Plus,
  X,
  ChevronsUpDown,
  PlusCircle,
  Loader,
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
import { CreateContest, CreateContestSchema } from "@/features/contest/types";
import {
  Challenge,
  CreateChallenge,
  CreateChallengeSchema,
} from "@/features/challenge/types";
import CreateChallengeForm from "@/features/challenge/ui/CreateChallengeForm";
import { useGetAllChallenges } from "@/features/challenge/api/use-get-all-challenges";
import { useCreateContest } from "../api/use-create-contest";
import { useCreateChallenge } from "@/features/challenge/api/use-create-challenge";
import { toast } from "sonner";

const difficultyColors: Record<string, string> = {
  EASY: "bg-success/15 text-success border-success/30",
  MEDIUM: "bg-warning/15 text-warning border-warning/30",
  HARD: "bg-destructive/15 text-destructive border-destructive/30",
};

const CreateContestForm = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNewChallengeForm, setShowNewChallengeForm] = useState(false);

  const { mutateAsync: createContest, isPending: isCreateContestPending } =
    useCreateContest();
  const { mutateAsync: createChallenge } = useCreateChallenge();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateContest>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateContestSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      start_time: undefined,
      end_time: undefined,
      challenges: [],
    },
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

  const { data: existingChallenges, isLoading } = useGetAllChallenges();

  // Read challenges directly from the form — always in sync, no stale closure issues
  const attachedChallenges = watch("challenges") ?? [];

  function attachExisting(challenge: Challenge) {
    if (attachedChallenges.some((c) => c.challenge_id === challenge.challenge_id)) {
      toast.warning("Challenge already attached.");
      setDropdownOpen(false);
      return;
    }
    setValue("challenges", [...attachedChallenges, challenge], {
      shouldValidate: true,
    });
    setDropdownOpen(false);
  }

  function removeAttached(challenge_id: string) {
    setValue(
      "challenges",
      attachedChallenges.filter((c) => c.challenge_id !== challenge_id),
      { shouldValidate: true },
    );
  }

  const onAddNewChallenge = async (values: CreateChallenge) => {
    try {
      const created: Challenge = await createChallenge(values);
      setValue("challenges", [...attachedChallenges, created], {
        shouldValidate: true,
      });
      resetChallenge();
      setShowNewChallengeForm(false);
    } catch (error) {
      console.error("Error creating challenge:", error);
    }
  };

  const onSubmit = async (values: CreateContest) => {
    try {
      await createContest(values);
    } catch (error) {
      console.error("Error creating contest:", error);
    } finally {
      reset();
      setOpen(false);
    }
  };

  return (
    <div className="space-y-5 pb-2 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
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

        <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto no-scrollbar pr-2 flex flex-col bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Create New Contest
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the details and attach challenges to your contest.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="flex-1 pr-4 -mr-4">
              {!showNewChallengeForm ? (
                <form
                  id="contest-form"
                  onSubmit={handleSubmit(onSubmit, (validationErrors) => {
                    console.log("Validation errors:", validationErrors);
                    toast.error(
                      validationErrors.challenges?.message ?? "Validation failed",
                    );
                  })}
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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

                    <Controller
                      name="end_time"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>End Time</FieldLabel>
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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

                  {/* Challenges — registered as a form field so Zod validates it */}
                  <Field data-invalid={!!errors.challenges}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <FieldLabel>Challenges</FieldLabel>
                        <span className="text-xs text-muted-foreground">
                          {attachedChallenges.length} attached
                        </span>
                      </div>

                      {attachedChallenges.length > 0 && (
                        <div className="space-y-2">
                          {attachedChallenges.map((c) => (
                            <div
                              key={c.challenge_id}
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
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-muted-foreground font-mono">
                                  {c.max_points}pts
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeAttached(c.challenge_id)}
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
                                (c: Challenge) => c.challenge_id === value,
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
                                {existingChallenges.map((c: Challenge) => (
                                  <CommandItem
                                    key={c.challenge_id}
                                    value={c.challenge_id}
                                    onSelect={() => attachExisting(c)}
                                    disabled={attachedChallenges.some(
                                      (a) => a.challenge_id === c.challenge_id,
                                    )}
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
                                      {c.max_points}pts
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

                      {errors.challenges && (
                        <FieldError errors={[errors.challenges]} />
                      )}
                    </div>
                  </Field>

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
                    <Button
                      type="submit"
                      className="cursor-pointer"
                      disabled={isCreateContestPending}
                    >
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateContestForm;