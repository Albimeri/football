export class PromptData {
    constructor(title: string, content: string, buttonDescription: string, buttonClass?: string,promptButtonDescription?:string,isIcon?:boolean) {
        this.Title = title;
        this.Content = content;
        this.ButtonDescription = buttonDescription;
        this.ButtonClass = buttonClass || 'primary';
        this.IsIcon = isIcon || false;
        this.PromptButtonDescription = promptButtonDescription || 'Save';
        
    }
    Title: string;
    Content: string;
    ButtonDescription: string;
    ButtonClass: string;
    PromptButtonDescription: string;
    IsIcon:boolean;
}