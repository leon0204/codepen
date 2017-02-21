#### 其他通知格式选项

你可以使用 `view` 方法来指定一个应用于渲染通知电子邮件的自定义模板，而不是在通知类中定义文本的「模板」：

    /**
     * 获取通知的邮件展示方式
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)->view(
            'emails.name', ['invoice' => $this->invoice]
        );
    }
