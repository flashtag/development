
<div class="nav-pf-vertical nav-pf-vertical-with-secondary-nav">
    <ul class="list-group">
        <li class="list-group-item {{ Flashtag\Admin\set_active('') }}">
            <a href="/admin">
                <span class="fa fa-dashboard"></span>
                <span class="list-group-item-value">Dashboard</span>
            </a>
        </li>
        @foreach (Flashtag\Admin\menu() as $section)
            <li class="list-group-item persistent-secondary {{ Flashtag\Admin\set_active(array_keys($section['items'])) }}"
                data-target="#content-secondary">
                <a href="#">
                    {!! $section['icon'] or '' !!}
                    <span class="list-group-item-value">{{ $section['label'] }}</span>
                </a>
                <div id="content-secondary" class="nav-pf-persistent-secondary">
                    <div class="persistent-secondary-header">
                        <a class="fa fa-arrow-circle-o-left" href="#" data-toggle="collapse-secondary-nav"></a>
                        <span>{{ $section['label'] }}</span>
                    </div>
                    @foreach ($section['items'] as $subsection)
                        <h5>{{ $subsection['label'] }}</h5>
                        <ul class="list-group">
                            @foreach ($subsection['items'] as $item)
                                <li class="list-group-item {{ Flashtag\Admin\set_active($item['name']) }}">
                                    <a href="{{ $item['route'] }}">
                                        <span class="list-group-item-value">{{ $item['label'] }}</span>
                                        @if (isset($item['count']))
                                            <div class="badge-container-pf">
                                                <span class="badge">{{ $item['count'] }}</span>
                                            </div>
                                        @endif
                                    </a>
                                </li>
                            @endforeach
                        </ul>
                    @endforeach
                </div>
            </li>
        @endforeach
    </ul>
</div>
