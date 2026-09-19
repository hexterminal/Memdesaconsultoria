$root = "E:\Documents\Empresa\site\Site Oficial\Site Oficial Ajustado EM USO"
$files = Get-ChildItem -Path $root -Filter *.html -Recurse

foreach ($file in $files) {
    $text = [System.IO.File]::ReadAllText($file.FullName, [System.Text.UTF8Encoding]::new($false))
    $matches = [regex]::Matches($text, '(?is)<form\b.*?</form>')
    if ($matches.Count -eq 0) { continue }

    $builder = New-Object System.Text.StringBuilder
    $lastIndex = 0

    for ($i = 0; $i -lt $matches.Count; $i++) {
        $match = $matches[$i]
        $block = $match.Value
        $prefix = if ($i -eq 0) { 'contact' } elseif ($i -eq 1) { 'footer-contact' } else { "contact-$($i + 1)" }

        if ($block -match '(?i)<form\b[^>]*\s+id=') {
            $block = [regex]::Replace($block, '(?i)(<form\b[^>]*?\s+id=")([^"]*)(")', "`$1$prefix`$3", 1)
        }
        else {
            $block = $block -replace '<form', "<form id=\"$prefix\"", 1
        }

        $replacements = @{
            'id="name"' = "id=\"$prefix-name\"";
            'id="email"' = "id=\"$prefix-email\"";
            'id="subject"' = "id=\"$prefix-subject\"";
            'id="message"' = "id=\"$prefix-message\"";
            'id="form-submit"' = "id=\"$prefix-submit\"";
            'id="footer-name"' = "id=\"$prefix-name\"";
            'id="footer-email"' = "id=\"$prefix-email\"";
            'id="footer-subject"' = "id=\"$prefix-subject\"";
            'id="footer-message"' = "id=\"$prefix-message\"";
            'id="footer-submit"' = "id=\"$prefix-submit\"";
            'id="contact-name"' = "id=\"$prefix-name\"";
            'id="contact-email"' = "id=\"$prefix-email\"";
            'id="contact-subject"' = "id=\"$prefix-subject\"";
            'id="contact-message"' = "id=\"$prefix-message\"";
            'id="contact-submit"' = "id=\"$prefix-submit\"";
            'id="footer-contact-name"' = "id=\"$prefix-name\"";
            'id="footer-contact-email"' = "id=\"$prefix-email\"";
            'id="footer-contact-subject"' = "id=\"$prefix-subject\"";
            'id="footer-contact-message"' = "id=\"$prefix-message\"";
            'id="footer-contact-submit"' = "id=\"$prefix-submit\""
        }

        foreach ($entry in $replacements.GetEnumerator()) {
            $block = $block.Replace($entry.Key, $entry.Value)
        }

        [void]$builder.Append($text.Substring($lastIndex, $match.Index - $lastIndex))
        [void]$builder.Append($block)
        $lastIndex = $match.Index + $match.Length
    }

    [void]$builder.Append($text.Substring($lastIndex))
    $result = $builder.ToString()
    [System.IO.File]::WriteAllText($file.FullName, $result, [System.Text.UTF8Encoding]::new($false))
}

$bad = @()
foreach ($file in (Get-ChildItem -Path $root -Filter *.html -Recurse)) {
    $text = [System.IO.File]::ReadAllText($file.FullName, [System.Text.UTF8Encoding]::new($false))
    $ids = [regex]::Matches($text, 'id="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
    $counts = @{}
    foreach ($id in $ids) {
        if ($counts.ContainsKey($id)) {
            $counts[$id] += 1
        }
        else {
            $counts[$id] = 1
        }
    }

    foreach ($entry in $counts.GetEnumerator()) {
        if ($entry.Value -gt 1) {
            $bad += [pscustomobject]@{ File = $file.FullName; ID = $entry.Key; Count = $entry.Value }
        }
    }
}

if ($bad.Count -gt 0) {
    $bad | Format-Table -AutoSize
    exit 1
}

Write-Output 'NO_DUPLICATE_IDS_FOUND'
Write-Output ('HTML_FILES=' + ((Get-ChildItem -Path $root -Filter *.html -Recurse | Measure-Object).Count))
