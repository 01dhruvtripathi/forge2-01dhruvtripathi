<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Slack\SlackMessage;

class TicketActivitySlackNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Ticket $ticket;
    public string $action;
    public string $actorName;
    public ?string $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(Ticket $ticket, string $action, string $actorName, ?string $message = null)
    {
        $this->ticket = $ticket;
        $this->action = $action;
        $this->actorName = $actorName;
        $this->message = $message;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['slack'];
    }

    /**
     * Get the Slack representation of the notification.
     */
    public function toSlack(object $notifiable): SlackMessage
    {
        $statusEmoji = match($this->ticket->status) {
            'open' => '🆕',
            'in_progress' => '⏳',
            'resolved' => '✅',
            'closed' => '🔒',
            default => '🎫'
        };

        $message = (new SlackMessage)->text("{$statusEmoji} Ticket {$this->action} by {$this->actorName}")
            ->headerBlock("Ticket #{$this->ticket->id}: {$this->ticket->subject}");
            
        if ($this->message) {
            $message->sectionBlock(function ($block) {
                $block->text($this->message);
            });
        }
        
        $assigneeName = $this->ticket->assignee ? $this->ticket->assignee->name : 'Unassigned';
        $status = ucfirst(str_replace('_', ' ', $this->ticket->status));
        $priority = ucfirst($this->ticket->priority);

        $message->sectionBlock(function ($block) use ($status, $priority, $assigneeName) {
            $block->field("*Status:*\n{$status}")->markdown();
            $block->field("*Priority:*\n{$priority}")->markdown();
            $block->field("*Assignee:*\n{$assigneeName}")->markdown();
        });

        return $message;
    }
}
