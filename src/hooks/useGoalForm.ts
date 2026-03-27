import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGoalSchema, CreateGoalFormValues } from "@/lib/validations/goal";
import { GOAL_TEMPLATES } from "@/lib/templates";

export interface UseGoalFormProps {
    myMemberId: string;
    isMemberOnly: boolean;
    membersCount: number;
    memberIds: string[];
}

export function useGoalForm({ myMemberId, isMemberOnly, membersCount, memberIds }: UseGoalFormProps) {
    const now = Date.now();
    
    const form = useForm<CreateGoalFormValues>({
        resolver: zodResolver(createGoalSchema),
        defaultValues: {
            title: "",
            description: "",
            emoji: "🎯",
            category: "General",
            priority: "medium",
            frequency: undefined,
            startDate: new Date(now).toISOString().split('T')[0],
            deadline: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            assigneeIds: myMemberId ? [myMemberId] : [],
            goalType: undefined,
            targetValue: "",
            targetNumber: 50,
            unit: "Tasks",
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
            setValue("assigneeIds", [myMemberId]);
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
                assigneeIds: myMemberId ? [myMemberId] : [],
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
            assigneeIds: myMemberId ? [myMemberId] : [],
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
