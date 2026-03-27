import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGoalSchema, CreateGoalFormValues } from "@/lib/validations/goal";
import { GOAL_TEMPLATES } from "@/lib/templates";

export interface UseGoalFormProps {
    myMemberId: string;
    isMemberOnly: boolean;
    membersCount: number;
    memberIds: string[];
    initialValues?: Partial<CreateGoalFormValues>;
}

export function useGoalForm({ 
    myMemberId, 
    isMemberOnly, 
    membersCount, 
    memberIds,
    initialValues 
}: UseGoalFormProps) {
    const now = Date.now();
    
    // Format dates if they exist in initialValues
    const formatInitialDate = (dateStr?: string) => {
        if (!dateStr) return undefined;
        try {
            return new Date(dateStr).toISOString().split('T')[0];
        } catch (e) {
            return undefined;
        }
    };

    const form = useForm<CreateGoalFormValues>({
        resolver: zodResolver(createGoalSchema),
        defaultValues: {
            title: initialValues?.title || "",
            description: initialValues?.description || "",
            emoji: initialValues?.emoji || "🎯",
            category: initialValues?.category || "General",
            priority: initialValues?.priority || "medium",
            frequency: initialValues?.frequency,
            startDate: formatInitialDate(initialValues?.startDate) || new Date(now).toISOString().split('T')[0],
            deadline: formatInitialDate(initialValues?.deadline) || new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            assigneeIds: initialValues?.assigneeIds || (myMemberId && isMemberOnly ? [myMemberId] : []),
            goalType: initialValues?.goalType,
            targetValue: initialValues?.targetValue || "",
            targetNumber: initialValues?.targetNumber ?? 50,
            unit: initialValues?.unit || "Tasks",
        },
    });

    const { setValue, watch, reset } = form;
    const selectedAssignees = watch("assigneeIds") || [];

    const toggleAssignee = (id: string) => {
        if (isMemberOnly) return; 
        const current = [...selectedAssignees];
        if (current.includes(id)) {
            setValue("assigneeIds", current.filter(i => i !== id));
        } else {
            setValue("assigneeIds", [...current, id]);
        }
    };

    const toggleEveryone = () => {
        if (isMemberOnly) return; 
        if (selectedAssignees.length === membersCount) {
            setValue("assigneeIds", []);
        } else {
            setValue("assigneeIds", memberIds);
        }
    };

    const applyTemplate = (templateId: string) => {
        const template = GOAL_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        if (template.id === 'tpl-custom') {
            reset({
                title: "",
                description: "",
                emoji: "🎯",
                category: "General",
                priority: "medium",
                frequency: "one_time",
                startDate: new Date(now).toISOString().split('T')[0],
                deadline: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                assigneeIds: (myMemberId && isMemberOnly) ? [myMemberId] : [],
                goalType: "milestone",
                targetValue: "",
                targetNumber: 50,
                unit: "Tasks",
            });
            return;
        }

        const isMetric = template.targetNumber !== undefined;
        const unit = template.unit || "Items";
        const targetNumber = template.targetNumber || 10;

        reset({
            title: template.title,
            description: template.description,
            emoji: template.emoji,
            category: template.category,
            priority: template.priority,
            frequency: template.cadence || "one_time",
            startDate: new Date(now).toISOString().split('T')[0],
            deadline: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            assigneeIds: (myMemberId && isMemberOnly) ? [myMemberId] : [],
            goalType: isMetric ? "metric" : "milestone",
            targetValue: isMetric ? `${targetNumber} ${unit}` : template.title,
            targetNumber: targetNumber,
            unit: unit,
        });
    };

    return {
        form,
        toggleAssignee,
        toggleEveryone,
        applyTemplate,
    };
}
